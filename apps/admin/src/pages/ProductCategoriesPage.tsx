import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { hasAdminPermission, post, put } from '../api';
import { ProductCategory } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

export function ProductCategoriesPage() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<ProductCategory>('/admin/product-categories');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductCategory | null>(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('active');
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:product');

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const matchKeyword = item.name.toLowerCase().includes(keyword.trim().toLowerCase());
      const matchStatus = status ? item.status === status : true;
      return matchKeyword && matchStatus;
    });
  }, [data, keyword, status]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ sort: 0 });
    setOpen(true);
  }

  function openEdit(record: ProductCategory) {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    if (editing) {
      await put(`/admin/product-categories/${editing.id}`, values);
      message.success('分类已更新');
    } else {
      await post('/admin/product-categories', values);
      message.success('分类已创建');
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
    await reload();
  }

  async function toggleStatus(record: ProductCategory) {
    const next = record.status === 'active' ? 'inactive' : 'active';
    await put(`/admin/product-categories/${record.id}`, { status: next });
    message.success(`分类已${next === 'active' ? '恢复' : '删除'}`);
    await reload();
  }

  return (
    <div className="page-card">
      <PageHeader
        title="产品分类"
        description="维护前台用于导航的产品分类"
        onRefresh={reload}
        extra={
          canWrite ? (
            <Button type="primary" onClick={openCreate}>
              新增分类
            </Button>
          ) : null
        }
      />
      <div className="filter-bar">
        <Input.Search
          allowClear
          style={{ width: 240 }}
          placeholder="搜索分类名"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
        />
        <Select
          allowClear
          placeholder="状态"
          style={{ width: 140 }}
          value={status}
          onChange={(value) => setStatus(value)}
          options={[
            { value: 'active', label: '启用' },
            { value: 'inactive', label: '停用' },
          ]}
        />
      </div>
      <Table<ProductCategory>
        rowKey="id"
        dataSource={filtered}
        loading={loading}
        pagination={{ pageSize: 20 }}
        columns={[
          { title: '编号', dataIndex: 'id', width: 80 },
          { title: '名称', dataIndex: 'name' },
          { title: '排序', dataIndex: 'sort', width: 100 },
          {
            title: '状态',
            dataIndex: 'status',
            width: 100,
            render: (value: string) => (
              <Tag color={value === 'active' ? 'green' : 'default'}>
                {value === 'active' ? '启用' : '停用'}
              </Tag>
            ),
          },
          canWrite
            ? {
                title: '操作',
                width: 180,
                render: (_, record) => (
                  <Space>
                    <Button type="link" onClick={() => openEdit(record)}>
                      编辑
                    </Button>
                    <Popconfirm
                      title={record.status === 'active' ? '确定删除该分类？' : '确定恢复该分类？'}
                      description={record.status === 'active' ? '删除后默认列表不再显示，可通过状态筛选找回。' : undefined}
                      onConfirm={() => toggleStatus(record)}
                    >
                      <Button type="link" danger={record.status === 'active'}>
                        {record.status === 'active' ? '删除' : '恢复'}
                      </Button>
                    </Popconfirm>
                  </Space>
                ),
              }
            : {},
        ]}
      />
      <Modal
        open={open}
        title={editing ? '编辑分类' : '新增分类'}
        onCancel={() => setOpen(false)}
        onOk={submit}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="分类名称" rules={[{ required: true }]}>
            <Input maxLength={32} />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} max={9999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="parentId" label="上级分类">
            <Select
              allowClear
              placeholder="顶级分类"
              options={filtered
                .filter((item) => !editing || item.id !== editing.id)
                .map((item) => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>
          {editing && (
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { value: 'active', label: '启用' },
                  { value: 'inactive', label: '停用' },
                ]}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}
