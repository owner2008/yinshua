#!/usr/bin/env python3
"""Rotate API/MySQL credentials without writing secrets to command output."""

import argparse
import copy
import json
import os
import re
import secrets
import subprocess
import sys
from pathlib import Path
from urllib.parse import quote, unquote, urlsplit, urlunsplit

import yaml


def read_compose(path):
    data = yaml.safe_load(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict) or not isinstance(data.get("services"), dict):
        raise ValueError("Invalid Compose file")
    return data


def environments(data):
    services = data["services"]
    return services["qddflc-api"]["environment"], services["qddflc-db"]["environment"]


def account(data):
    api, db = environments(data)
    url = urlsplit(api["DATABASE_URL"])
    username = unquote(url.username or "")
    password = unquote(url.password or "")
    if (
        url.scheme != "mysql"
        or url.hostname != "qddflc-db"
        or not re.fullmatch(r"[A-Za-z0-9_]+", username)
        or username != db["MYSQL_USER"]
        or password != db["MYSQL_PASSWORD"]
        or not db["MYSQL_ROOT_PASSWORD"]
    ):
        raise ValueError("Database credentials are inconsistent")
    return url, username, password


def save_new(path, data):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as output:
            yaml.safe_dump(data, output, allow_unicode=True)
    except BaseException:
        if path.exists():
            path.unlink()
        raise


def prepare(original, safe, candidate):
    base = read_compose(original)
    result = copy.deepcopy(read_compose(safe))
    old_api, old_db = environments(base)
    api, db = environments(result)
    if api != old_api or db != old_db:
        raise ValueError("Safe Compose changed existing credentials")
    if (
        result["services"]["qddflc-api"]["command"]
        != ["node", "dist-auth-20260924/src/main.js"]
        or result["services"]["qddflc-api"]["dns"] != ["10.89.0.1"]
        or result["services"]["qddflc-web"]["dns"] != ["10.89.0.1"]
    ):
        raise ValueError("Unsafe runtime configuration")

    url, username, _ = account(base)
    new_password = secrets.token_hex(32)
    host = url.hostname + ((":" + str(url.port)) if url.port else "")
    netloc = quote(username, safe="") + ":" + new_password + "@" + host
    api["DATABASE_URL"] = urlunsplit(
        (url.scheme, netloc, url.path, url.query, url.fragment)
    )
    api["ADMIN_AUTH_SECRET"] = secrets.token_hex(48)
    api["MEMBER_AUTH_SECRET"] = secrets.token_hex(48)
    db["MYSQL_PASSWORD"] = new_password
    db["MYSQL_ROOT_PASSWORD"] = secrets.token_hex(32)
    account(result)
    save_new(candidate, result)


def sql_literal(value):
    if "\n" in value or "\r" in value or "\0" in value:
        raise ValueError("Unsupported password character")
    return "'" + value.replace("\\", "\\\\").replace("'", "''") + "'"


def mysql(username, password, host, statement):
    if not re.fullmatch(r"[A-Za-z0-9_]+", username):
        raise ValueError("Unexpected database username")
    if "\n" in password or "\r" in password:
        raise ValueError("Unsupported password character")
    command = [
        "podman", "exec", "-i", "qddflc-db", "sh", "-c",
        'IFS= read -r DB_PASSWORD; export MYSQL_PWD="$DB_PASSWORD"; exec mysql -u "$1" -h "$2" --batch --skip-column-names',
        "mysql-client", username, host,
    ]
    result = subprocess.run(
        command,
        input=password + "\n" + statement + "\n",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        universal_newlines=True,
        timeout=30,
    )
    if result.returncode:
        raise RuntimeError("Database operation failed")
    return result.stdout.strip()


def rotate_app(original, candidate, rollback):
    old = read_compose(original)
    new = read_compose(candidate)
    _, username, old_password = account(old)
    _, new_username, new_password = account(new)
    if username != new_username:
        raise ValueError("Database username changed")
    root_password = environments(old)[1]["MYSQL_ROOT_PASSWORD"]
    target = old_password if rollback else new_password
    mysql(
        "root", root_password, "localhost",
        "ALTER USER '" + username + "'@'%' IDENTIFIED BY " + sql_literal(target) + ";",
    )
    if mysql(username, target, "127.0.0.1", "SELECT 1;") != "1":
        raise RuntimeError("App authentication verification failed")


def rotate_root(original, candidate, rollback):
    old = read_compose(original)
    new = read_compose(candidate)
    old_password = environments(old)[1]["MYSQL_ROOT_PASSWORD"]
    new_password = environments(new)[1]["MYSQL_ROOT_PASSWORD"]
    source = new_password if rollback else old_password
    target = old_password if rollback else new_password
    statement = (
        "ALTER USER 'root'@'%' IDENTIFIED BY " + sql_literal(target)
        + ", 'root'@'localhost' IDENTIFIED BY " + sql_literal(target) + ";"
    )
    mysql("root", source, "localhost", statement)
    if mysql("root", target, "localhost", "SELECT 1;") != "1":
        raise RuntimeError("Root authentication verification failed")


def verify(candidate):
    data = read_compose(candidate)
    _, username, password = account(data)
    db = environments(data)[1]
    if mysql(username, password, "127.0.0.1", "SELECT 1;") != "1":
        raise RuntimeError("App authentication verification failed")
    if mysql("root", db["MYSQL_ROOT_PASSWORD"], "localhost", "SELECT 1;") != "1":
        raise RuntimeError("Root authentication verification failed")


def verify_runtime(candidate):
    data = read_compose(candidate)
    for service, keys in (
        ("qddflc-api", ("DATABASE_URL", "ADMIN_AUTH_SECRET", "MEMBER_AUTH_SECRET")),
        ("qddflc-db", ("MYSQL_PASSWORD", "MYSQL_ROOT_PASSWORD")),
    ):
        raw = subprocess.check_output(["podman", "inspect", service], timeout=15)
        running = json.loads(raw.decode("utf-8"))[0]
        actual = dict(item.split("=", 1) for item in running["Config"]["Env"] if "=" in item)
        expected = data["services"][service]["environment"]
        if any(actual.get(key) != expected[key] for key in keys):
            raise RuntimeError("Runtime credentials differ from Compose")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "action", choices=("preflight", "prepare", "apply-app", "rollback-app", "apply-root", "rollback-root", "verify", "verify-runtime", "commit")
    )
    parser.add_argument("original", type=Path)
    parser.add_argument("candidate", type=Path)
    parser.add_argument("--safe", type=Path)
    args = parser.parse_args()

    if args.action == "preflight":
        verify(args.original)
    elif args.action == "prepare":
        if args.safe is None or args.original.parent.resolve() != args.candidate.parent.resolve():
            raise ValueError("Safe Compose and same-directory output are required")
        prepare(args.original, args.safe, args.candidate)
    elif args.action == "apply-app":
        rotate_app(args.original, args.candidate, False)
    elif args.action == "rollback-app":
        rotate_app(args.original, args.candidate, True)
    elif args.action == "apply-root":
        rotate_root(args.original, args.candidate, False)
    elif args.action == "rollback-root":
        rotate_root(args.original, args.candidate, True)
    elif args.action == "verify":
        verify(args.candidate)
    elif args.action == "verify-runtime":
        verify(args.candidate)
        verify_runtime(args.candidate)
    else:
        verify(args.candidate)
        verify_runtime(args.candidate)
        if args.candidate.parent.resolve() != args.original.parent.resolve():
            raise ValueError("Original and candidate must share a directory")
        os.replace(str(args.candidate), str(args.original))
    print(args.action.upper().replace("-", "_") + "_OK")


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print("ROTATION_FAILED:" + type(error).__name__, file=sys.stderr)
        sys.exit(1)
