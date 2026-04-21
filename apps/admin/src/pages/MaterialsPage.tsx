import { App, Button, Form, Input, InputNumber, Modal, Table, Tabs } from 'antd';
import { useState } from 'react';
import { post } from '../api';
import { Material } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

export function MaterialsPage() {
  return (
    <div className="page-card">
      <Tabs
        items={[
          { key: 'materials', label: '材料', children: <MaterialList /> },
          { key: 'prices', label: '材料价格', children: <MaterialPrices /> },
        ]}
      />
    </div>
  );
}

function MaterialList() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Material>('/admin/materials');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    await post('/admin/materials', form.getFieldsValue());
    message.success('材料已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="材料管理" onRefresh={reload} extra={<Button type="primary" onClick={() => setOpen(true)}>新增材料</Button>} />
      <Table rowKey="id" loading={loading} dataSource={data} columns={[
        { title: 'ID', dataIndex: 'id' },
        { title: '编码', dataIndex: 'code' },
        { title: '名称', dataIndex: 'name' },
        { title: '类型', dataIndex: 'type' },
        { title: '单位', dataIndex: 'unit' },
        { title: '状态', dataIndex: 'status' },
      ]} />
      <Modal title="新增材料" open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ type: 'face', unit: 'm2' }}>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="unit" label="单位" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function MaterialPrices() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Record<string, unknown>>('/admin/material-prices');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    await post('/admin/material-prices', form.getFieldsValue());
    message.success('材料价格已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="材料价格" description="新增价格后旧 current 价格会失效" onRefresh={reload} extra={<Button type="primary" onClick={() => setOpen(true)}>新增价格</Button>} />
      <Table rowKey="id" loading={loading} dataSource={data} columns={[
        { title: 'ID', dataIndex: 'id' },
        { title: '材料ID', dataIndex: 'materialId' },
        { title: '单价', dataIndex: 'unitPrice' },
        { title: '币种', dataIndex: 'currency' },
        { title: '当前', dataIndex: 'isCurrent', render: Boolean },
      ]} />
      <Modal title="新增材料价格" open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ priceType: 'calc', currency: 'CNY' }}>
          <Form.Item name="materialId" label="材料ID" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="unitPrice" label="单价" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
          <Form.Item name="priceType" label="价格类型"><Input /></Form.Item>
          <Form.Item name="currency" label="币种"><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
