import { App, Button, Form, Input, InputNumber, Modal, Table, Tabs } from 'antd';
import { useState } from 'react';
import { post } from '../api';
import { Warehouse } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

export function InventoryPage() {
  return (
    <div className="page-card">
      <Tabs
        items={[
          { key: 'warehouses', label: '仓库', children: <Warehouses /> },
          { key: 'items', label: '库存', children: <StockItems /> },
          { key: 'movements', label: '流水', children: <Movements /> },
        ]}
      />
    </div>
  );
}

function Warehouses() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Warehouse>('/admin/warehouses');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    await post('/admin/warehouses', form.getFieldsValue());
    message.success('仓库已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="仓库管理" onRefresh={reload} extra={<Button type="primary" onClick={() => setOpen(true)}>新增仓库</Button>} />
      <Table rowKey="id" loading={loading} dataSource={data} columns={[
        { title: 'ID', dataIndex: 'id' },
        { title: '名称', dataIndex: 'name' },
        { title: '编码', dataIndex: 'code' },
        { title: '类型', dataIndex: 'type' },
        { title: '状态', dataIndex: 'status' },
      ]} />
      <Modal title="新增仓库" open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ type: 'raw' }}>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function StockItems() {
  const { data, loading, reload } = useRemoteList<Record<string, unknown>>('/admin/stock-items');
  return (
    <>
      <PageHeader title="库存项" onRefresh={reload} />
      <Table rowKey="id" loading={loading} dataSource={data} columns={[
        { title: 'ID', dataIndex: 'id' },
        { title: '材料ID', dataIndex: 'materialId' },
        { title: '仓库ID', dataIndex: 'warehouseId' },
        { title: '库存数量', dataIndex: 'qty' },
        { title: '可用数量', dataIndex: 'availableQty' },
        { title: '安全库存', dataIndex: 'safetyQty' },
      ]} />
    </>
  );
}

function Movements() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Record<string, unknown>>('/admin/stock-movements');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    await post('/admin/stock-movements', form.getFieldsValue());
    message.success('库存流水已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="库存流水" description="支持入库、出库、调整" onRefresh={reload} extra={<Button type="primary" onClick={() => setOpen(true)}>新增流水</Button>} />
      <Table rowKey="id" loading={loading} dataSource={data} columns={[
        { title: '流水号', dataIndex: 'movementNo' },
        { title: '类型', dataIndex: 'movementType' },
        { title: '材料ID', dataIndex: 'materialId' },
        { title: '仓库ID', dataIndex: 'warehouseId' },
        { title: '数量', dataIndex: 'qty' },
        { title: '成本', dataIndex: 'unitCost' },
      ]} />
      <Modal title="新增库存流水" open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ movementType: 'in' }}>
          <Form.Item name="movementType" label="类型" rules={[{ required: true }]}><Input placeholder="in / out / adjust" /></Form.Item>
          <Form.Item name="warehouseId" label="仓库ID" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="materialId" label="材料ID" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="qty" label="数量" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
          <Form.Item name="unitCost" label="单位成本"><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
