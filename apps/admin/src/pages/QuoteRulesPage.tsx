import { App, Button, Form, Input, InputNumber, Modal, Table, Tabs } from 'antd';
import { useState } from 'react';
import { post } from '../api';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

export function QuoteRulesPage() {
  return (
    <div className="page-card">
      <Tabs
        items={[
          { key: 'sets', label: '规则集', children: <RuleSets /> },
          { key: 'rules', label: '规则明细', children: <Rules /> },
        ]}
      />
    </div>
  );
}

function RuleSets() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Record<string, unknown>>('/admin/quote-rule-sets');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    await post('/admin/quote-rule-sets', form.getFieldsValue());
    message.success('规则集已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="报价规则集" onRefresh={reload} extra={<Button type="primary" onClick={() => setOpen(true)}>新增规则集</Button>} />
      <Table rowKey="id" loading={loading} dataSource={data} columns={[
        { title: 'ID', dataIndex: 'id' },
        { title: '模板ID', dataIndex: 'productTemplateId' },
        { title: '名称', dataIndex: 'name' },
        { title: '场景', dataIndex: 'scene' },
        { title: '版本', dataIndex: 'versionNo' },
        { title: '状态', dataIndex: 'status' },
      ]} />
      <Modal title="新增规则集" open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ productTemplateId: 1, scene: 'retail', priority: 1 }}>
          <Form.Item name="productTemplateId" label="模板ID" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="scene" label="场景" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="priority" label="优先级"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="versionNo" label="版本号" rules={[{ required: true }]}><Input /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function Rules() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Record<string, unknown>>('/admin/quote-rules');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    const values = form.getFieldsValue();
    await post('/admin/quote-rules', {
      ruleSetId: values.ruleSetId,
      conditionJson: JSON.parse(values.conditionJson),
      configJson: JSON.parse(values.configJson),
    });
    message.success('规则已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="报价规则" onRefresh={reload} extra={<Button type="primary" onClick={() => setOpen(true)}>新增规则</Button>} />
      <Table rowKey="id" loading={loading} dataSource={data} columns={[
        { title: 'ID', dataIndex: 'id' },
        { title: '规则集ID', dataIndex: 'ruleSetId' },
        { title: '启用', dataIndex: 'enabled', render: Boolean },
        { title: '条件', dataIndex: 'conditionJson', render: (value) => JSON.stringify(value) },
        { title: '配置', dataIndex: 'configJson', render: (value) => JSON.stringify(value) },
      ]} />
      <Modal title="新增规则" open={open} onOk={submit} onCancel={() => setOpen(false)} width={720}>
        <Form form={form} layout="vertical" initialValues={{
          ruleSetId: 1,
          conditionJson: '{"quantityRange":[100,100000],"widthRange":[20,500],"heightRange":[20,500],"customerTypes":["personal"]}',
          configJson: '{"lossRate":1.08,"profitRate":1.35,"memberRate":1,"minPrice":300,"packageFee":20,"urgentFeeRate":0.15}',
        }}>
          <Form.Item name="ruleSetId" label="规则集ID" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="conditionJson" label="条件 JSON" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="configJson" label="配置 JSON" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
