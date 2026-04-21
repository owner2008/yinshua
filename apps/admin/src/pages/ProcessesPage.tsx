import { App, Button, Form, Input, InputNumber, Modal, Table, Tabs } from 'antd';
import { useState } from 'react';
import { post } from '../api';
import { Process } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

export function ProcessesPage() {
  return (
    <div className="page-card">
      <Tabs
        items={[
          { key: 'processes', label: '工艺', children: <ProcessList /> },
          { key: 'processPrices', label: '工艺价格', children: <ProcessPrices /> },
          { key: 'printPrices', label: '印刷价格', children: <PrintPrices /> },
        ]}
      />
    </div>
  );
}

function ProcessList() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Process>('/admin/processes');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    await post('/admin/processes', form.getFieldsValue());
    message.success('工艺已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="工艺管理" onRefresh={reload} extra={<Button type="primary" onClick={() => setOpen(true)}>新增工艺</Button>} />
      <Table rowKey="id" loading={loading} dataSource={data} columns={[
        { title: 'ID', dataIndex: 'id' },
        { title: '编码', dataIndex: 'code' },
        { title: '名称', dataIndex: 'name' },
        { title: '类型', dataIndex: 'processType' },
        { title: '计费方式', dataIndex: 'feeMode' },
        { title: '状态', dataIndex: 'status' },
      ]} />
      <Modal title="新增工艺" open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ processType: 'surface', feeMode: 'per_area' }}>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="processType" label="类型" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="feeMode" label="计费方式" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function ProcessPrices() {
  return <PriceFormTable path="/admin/process-prices" title="工艺价格" fields={[['processId', '工艺ID'], ['feeMode', '计费方式'], ['unitPrice', '单价'], ['setupFee', '固定费'], ['minFee', '最低收费']]} />;
}

function PrintPrices() {
  return <PriceFormTable path="/admin/print-prices" title="印刷价格" fields={[['printMode', '印刷方式'], ['feeMode', '计费方式'], ['unitPrice', '单价'], ['setupFee', '开机费']]} />;
}

function PriceFormTable({ path, title, fields }: { path: string; title: string; fields: Array<[string, string]> }) {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Record<string, unknown>>(path);
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    await post(path, form.getFieldsValue());
    message.success(`${title}已创建`);
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title={title} onRefresh={reload} extra={<Button type="primary" onClick={() => setOpen(true)}>新增</Button>} />
      <Table rowKey="id" loading={loading} dataSource={data} columns={fields.map(([dataIndex, label]) => ({ title: label, dataIndex }))} />
      <Modal title={`新增${title}`} open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical">
          {fields.filter(([name]) => name !== 'id').map(([name, label]) => (
            <Form.Item key={name} name={name} label={label} rules={[{ required: ['unitPrice', 'processId', 'printMode', 'feeMode'].includes(name) }]}>
              {name.toLowerCase().includes('price') || name.toLowerCase().includes('fee') || name.endsWith('Id') ? <InputNumber style={{ width: '100%' }} step={0.01} /> : <Input />}
            </Form.Item>
          ))}
        </Form>
      </Modal>
    </>
  );
}
