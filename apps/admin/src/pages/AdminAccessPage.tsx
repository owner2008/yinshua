import { Alert, App, Button, Form, Input, Modal, Popconfirm, Select, Space, Table, Tabs, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { post, put } from '../api';
import { AdminPermission, AdminRole, AdminUser } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

const permissionModuleLabels: Record<string, string> = {
  product: '产品管理',
  pricing: '价格管理',
  'quote-rule': '报价规则',
  quote: '报价单',
  member: '会员管理',
  inventory: '库存管理',
  'audit-log': '操作日志',
  permission: '权限管理',
};

export function AdminAccessPage() {
  const { message } = App.useApp();
  const users = useRemoteList<AdminUser>('/admin/admin-users');
  const roles = useRemoteList<AdminRole>('/admin/admin-roles');
  const permissions = useRemoteList<AdminPermission>('/admin/admin-permissions');
  const [userModal, setUserModal] = useState<AdminUser | 'new' | null>(null);
  const [roleModal, setRoleModal] = useState<AdminRole | 'new' | null>(null);
  const [userStatus, setUserStatus] = useState<string>('active');
  const [roleStatus, setRoleStatus] = useState<string>('active');
  const [userForm] = Form.useForm();
  const [roleForm] = Form.useForm();

  const roleOptions = useMemo(
    () => roles.data.map((role) => ({ label: `${role.name} (${role.code})`, value: Number(role.id) })),
    [roles.data],
  );
  const permissionOptions = useMemo(
    () =>
      permissions.data.map((permission) => ({
        label: `${permission.name} (${permission.code})`,
        value: Number(permission.id),
      })),
    [permissions.data],
  );
  const filteredUsers = useMemo(
    () => users.data.filter((user) => (userStatus ? user.status === userStatus : true)),
    [userStatus, users.data],
  );
  const filteredRoles = useMemo(
    () => roles.data.filter((role) => (roleStatus ? role.status === roleStatus : true)),
    [roleStatus, roles.data],
  );

  function openUser(record: AdminUser | 'new') {
    setUserModal(record);
    userForm.setFieldsValue(
      record === 'new'
        ? { status: 'active', roleIds: [] }
        : {
            displayName: record.displayName,
            status: record.status,
            roleIds: record.roles?.map((item) => Number(item.role.id)) ?? [],
          },
    );
  }

  function openRole(record: AdminRole | 'new') {
    setRoleModal(record);
    roleForm.setFieldsValue(
      record === 'new'
        ? { status: 'active', permissionIds: [] }
        : {
            name: record.name,
            description: record.description,
            status: record.status,
            permissionIds: record.permissions?.map((item) => Number(item.permission.id)) ?? [],
          },
    );
  }

  async function submitUser() {
    const values = await userForm.validateFields();
    if (userModal === 'new') {
      await post('/admin/admin-users', values);
      message.success('管理员已创建');
    } else if (userModal) {
      await put(`/admin/admin-users/${userModal.id}`, values);
      message.success('管理员已更新');
    }
    setUserModal(null);
    await users.reload();
  }

  async function submitRole() {
    const values = await roleForm.validateFields();
    if (roleModal === 'new') {
      await post('/admin/admin-roles', values);
      message.success('角色已创建');
    } else if (roleModal) {
      await put(`/admin/admin-roles/${roleModal.id}`, values);
      message.success('角色已更新');
    }
    setRoleModal(null);
    await roles.reload();
    await users.reload();
  }

  async function toggleUserStatus(record: AdminUser) {
    const nextStatus = record.status === 'active' ? 'disabled' : 'active';
    await put(`/admin/admin-users/${record.id}`, { status: nextStatus });
    message.success(`管理员已${nextStatus === 'active' ? '恢复' : '删除'}`);
    await users.reload();
  }

  async function toggleRoleStatus(record: AdminRole) {
    const nextStatus = record.status === 'active' ? 'disabled' : 'active';
    await put(`/admin/admin-roles/${record.id}`, { status: nextStatus });
    message.success(`角色已${nextStatus === 'active' ? '恢复' : '删除'}`);
    await roles.reload();
    await users.reload();
  }

  return (
    <div className="page-card">
      <PageHeader
        title="权限管理"
        description="维护后台管理员、角色与权限码"
        onRefresh={() => {
          void users.reload();
          void roles.reload();
          void permissions.reload();
        }}
      />
      <Alert
        className="inline-alert"
        type="info"
        showIcon
        message="系统会自动保留至少一个启用的权限管理员，避免所有人失去权限管理入口。"
      />
      <Tabs
        items={[
          {
            key: 'users',
            label: '管理员',
            children: (
              <>
                <div className="filter-bar">
                  <Button type="primary" onClick={() => openUser('new')}>新增管理员</Button>
                  <Select
                    allowClear
                    placeholder="状态"
                    value={userStatus}
                    onChange={setUserStatus}
                    style={{ width: 140 }}
                    options={statusOptions}
                  />
                </div>
                <Table
                  rowKey="id"
                  loading={users.loading}
                  dataSource={filteredUsers}
                  columns={[
                    { title: '账号', dataIndex: 'username', width: 160 },
                    { title: '名称', dataIndex: 'displayName', width: 160 },
                    { title: '状态', dataIndex: 'status', width: 100, render: renderStatus },
                    {
                      title: '角色',
                      render: (_, record) => (
                        <Space wrap>
                          {record.roles?.map((item) => <Tag key={item.role.id}>{item.role.name}</Tag>)}
                        </Space>
                      ),
                    },
                    { title: '最后登录', dataIndex: 'lastLoginAt', width: 200 },
                    {
                      title: '操作',
                      width: 160,
                      render: (_, record) => (
                        <Space>
                          <Button type="link" onClick={() => openUser(record)}>编辑</Button>
                          <Popconfirm
                            title={record.status === 'active' ? '确定删除该管理员？' : '确定恢复该管理员？'}
                            description={record.status === 'active' ? '删除后默认列表不再显示，可通过状态筛选找回。' : undefined}
                            onConfirm={() => toggleUserStatus(record)}
                          >
                            <Button type="link" danger={record.status === 'active'}>{record.status === 'active' ? '删除' : '恢复'}</Button>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                  scroll={{ x: 900 }}
                />
              </>
            ),
          },
          {
            key: 'roles',
            label: '角色',
            children: (
              <>
                <div className="filter-bar">
                  <Button type="primary" onClick={() => openRole('new')}>新增角色</Button>
                  <Select
                    allowClear
                    placeholder="状态"
                    value={roleStatus}
                    onChange={setRoleStatus}
                    style={{ width: 140 }}
                    options={statusOptions}
                  />
                </div>
                <Table
                  rowKey="id"
                  loading={roles.loading}
                  dataSource={filteredRoles}
                  columns={[
                    { title: '角色名', dataIndex: 'name', width: 180 },
                    { title: '编码', dataIndex: 'code', width: 180 },
                    { title: '状态', dataIndex: 'status', width: 100, render: renderStatus },
                    {
                      title: '权限',
                      render: (_, record) => (
                        <Space wrap>
                          {record.permissions?.map((item) => <Tag key={item.permission.id}>{item.permission.name}</Tag>)}
                        </Space>
                      ),
                    },
                    {
                      title: '操作',
                      width: 160,
                      render: (_, record) => (
                        <Space>
                          <Button type="link" onClick={() => openRole(record)}>编辑</Button>
                          <Popconfirm
                            title={record.status === 'active' ? '确定删除该角色？' : '确定恢复该角色？'}
                            description={record.status === 'active' ? '删除后默认列表不再显示，可通过状态筛选找回。' : undefined}
                            onConfirm={() => toggleRoleStatus(record)}
                          >
                            <Button type="link" danger={record.status === 'active'}>{record.status === 'active' ? '删除' : '恢复'}</Button>
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                  scroll={{ x: 1000 }}
                />
              </>
            ),
          },
          {
            key: 'permissions',
            label: '权限码',
            children: (
              <Table
                rowKey="id"
                loading={permissions.loading}
                dataSource={permissions.data}
                columns={[
                  { title: '模块', dataIndex: 'module', width: 140, render: renderPermissionModule },
                  { title: '权限码', dataIndex: 'code', width: 220 },
                  { title: '名称', dataIndex: 'name', width: 180 },
                  { title: '说明', dataIndex: 'description' },
                ]}
                scroll={{ x: 780 }}
              />
            ),
          },
        ]}
      />
      <Modal
        title={userModal === 'new' ? '新增管理员' : '编辑管理员'}
        open={Boolean(userModal)}
        onCancel={() => setUserModal(null)}
        onOk={submitUser}
        width={560}
      >
        <Form form={userForm} layout="vertical">
          {userModal === 'new' ? (
            <Form.Item name="username" label="账号" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item name="displayName" label="名称">
            <Input />
          </Form.Item>
          <Form.Item name="password" label={userModal === 'new' ? '初始密码' : '重置密码'} rules={userModal === 'new' ? [{ required: true, min: 6 }] : [{ min: 6 }]}>
            <Input.Password placeholder={userModal === 'new' ? undefined : '不填写则保持不变'} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="roleIds" label="角色">
            <Select mode="multiple" options={roleOptions} />
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        title={roleModal === 'new' ? '新增角色' : '编辑角色'}
        open={Boolean(roleModal)}
        onCancel={() => setRoleModal(null)}
        onOk={submitRole}
        width={720}
      >
        <Form form={roleForm} layout="vertical">
          {roleModal === 'new' ? (
            <Form.Item name="code" label="编码" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item name="name" label="角色名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="permissionIds" label="权限">
            <Select mode="multiple" options={permissionOptions} optionFilterProp="label" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
];

function renderStatus(value: string) {
  return <Tag color={value === 'active' ? 'green' : 'default'}>{value === 'active' ? '启用' : '停用'}</Tag>;
}

function renderPermissionModule(value?: string): string {
  return value ? permissionModuleLabels[value] ?? value : '-';
}
