#!/usr/bin/env python3
"""Render one Podman Compose file without printing production secrets."""

import argparse
import os
from pathlib import Path

import yaml


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("mode", choices=("safe", "rollback"))
    parser.add_argument("base", type=Path)
    parser.add_argument("overlay", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()

    if args.base.parent.resolve() != args.output.parent.resolve():
        raise SystemExit("Output must be beside the base Compose file")

    base = yaml.safe_load(args.base.read_text(encoding="utf-8"))
    overlay = yaml.safe_load(args.overlay.read_text(encoding="utf-8"))
    services = overlay.get("services", {})
    if set(services) != {"qddflc-api", "qddflc-web"}:
        raise SystemExit("Unexpected overlay services")
    if set(services["qddflc-api"]) != {"image", "command", "dns"}:
        raise SystemExit("Unexpected API overlay keys")
    if set(services["qddflc-web"]) != {"dns"}:
        raise SystemExit("Unexpected web overlay keys")

    expected_command = (
        ["node", "dist-auth-20260924/src/main.js"]
        if args.mode == "safe"
        else ["node", "dist/src/main.js"]
    )
    if services["qddflc-api"]["command"] != expected_command:
        raise SystemExit("Unexpected API command")
    if services["qddflc-api"]["image"] != "localhost/qddflc-api-runtime:20260924":
        raise SystemExit("Unexpected API image")
    if any(service["dns"] != ["10.89.0.1"] for service in services.values()):
        raise SystemExit("Unexpected DNS setting")

    for name, changes in services.items():
        if name not in base["services"]:
            raise SystemExit("Service missing from base Compose file")
        base["services"][name].update(changes)

    fd = os.open(args.output, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600)
    try:
        with os.fdopen(fd, "w", encoding="utf-8") as output:
            yaml.safe_dump(base, output, allow_unicode=True)
    except BaseException:
        if args.output.exists():
            args.output.unlink()
        raise


if __name__ == "__main__":
    main()
