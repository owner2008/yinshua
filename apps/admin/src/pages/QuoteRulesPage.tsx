import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tabs, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { hasAdminPermission, post, put } from '../api';
import { QuoteRule, QuoteRuleSet } from '../types';
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
  const { data, loading, reload } = useRemoteList<QuoteRuleSet>('/admin/quote-rule-sets');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuoteRuleSet | null>(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>();
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:quote-rule');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedKeyword = [item.name, item.scene, item.versionNo, item.productTemplateId].some((value) =>
        String(value).toLowerCase().includes(keyword.trim().toLowerCase()),
      );
      const matchedStatus = status ? item.status === status : true;
      return matchedKeyword && matchedStatus;
    });
  }, [data, keyword, status]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ productTemplateId: 1, scene: 'retail', priority: 1, status: 'active' });
    setOpen(true);
  }

  function openEdit(record: QuoteRuleSet) {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    if (editing) {
      await put(`/admin/quote-rule-sets/${editing.id}`, values);
      message.success('规则集已更新');
    } else {
      await post('/admin/quote-rule-sets', values);
      message.success('规则集已创建');
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
    await reload();
  }

  async function disable(record: QuoteRuleSet) {
    await put(`/admin/quote-rule-sets/${record.id}`, { status: 'inactive' });
    message.success('规则集已停用');
    await reload();
  }

  return (
    <>
      <PageHeader title="报价规则集" onRefresh={reload} extra={canWrite ? <Button type="primary" onClick={openCreate}>新增规则集</Button> : null} />
      <div className="filter-bar">
        <Input.Search
          allowClear
          placeholder="搜索名称、场景、版本或模板ID"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 300 }}
        />
        <Select
          allowClear
          placeholder="状态"
          value={status}
          onChange={setStatus}
          style={{ width: 140 }}
          options={[
            { label: '启用', value: 'active' },
            { label: '停用', value: 'inactive' },
          ]}
        />
      </div>
      <Table rowKey="id" loading={loading} dataSource={filteredData} columns={[
        { title: 'ID', dataIndex: 'id' },
        { title: '模板ID', dataIndex: 'productTemplateId' },
        { title: '名称', dataIndex: 'name' },
        { title: '场景', dataIndex: 'scene' },
        { title: '版本', dataIndex: 'versionNo' },
        { title: '优先级', dataIndex: 'priority' },
        { title: '规则数', render: (_, record) => record.rules?.length ?? 0 },
        {
          title: '状态',
          dataIndex: 'status',
          render: (value: string) => <Tag color={value === 'active' ? 'green' : 'default'}>{value === 'active' ? '启用' : '停用'}</Tag>,
        },
        canWrite ? {
          title: '操作',
          render: (_, record) => (
            <Space>
              <Button type="link" onClick={() => openEdit(record)}>编辑</Button>
              <Popconfirm title="确定停用该规则集？" onConfirm={() => disable(record)} disabled={record.status !== 'active'}>
                <Button type="link" danger disabled={record.status !== 'active'}>停用</Button>
              </Popconfirm>
            </Space>
          ),
        } : {},
      ]} />
      <Modal title={editing ? '编辑规则集' : '新增规则集'} open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical">
          {!editing ? <Form.Item name="productTemplateId" label="模板ID" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item> : null}
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="scene" label="场景" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="priority" label="优先级"><InputNumber style={{ width: '100%' }} /></Form.Item>
          <Form.Item name="versionNo" label="版本号" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '启用', value: 'active' },
                { label: '停用', value: 'inactive' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function Rules() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<QuoteRule>('/admin/quote-rules');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuoteRule | null>(null);
  const [enabled, setEnabled] = useState<string>('all');
  const [ruleSetId, setRuleSetId] = useState<string>();
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:quote-rule');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedEnabled = enabled === 'enabled' ? item.enabled : enabled === 'disabled' ? !item.enabled : true;
      const matchedRuleSet = ruleSetId ? String(item.ruleSetId) === ruleSetId : true;
      return matchedEnabled && matchedRuleSet;
    });
  }, [data, enabled, ruleSetId]);

  const ruleSetOptions = useMemo(() => Array.from(new Set(data.map((item) => String(item.ruleSetId)))).map((value) => ({ label: value, value })), [data]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      ruleSetId: 1,
      enabled: true,
      conditionJson: '{"quantityRange":[100,100000],"widthRange":[20,500],"heightRange":[20,500],"customerTypes":["personal"]}',
      configJson: '{"lossRate":1.08,"profitRate":1.35,"memberRate":1,"minPrice":300,"packageFee":20,"urgentFeeRate":0.15}',
    });
    setOpen(true);
  }

  function openEdit(record: QuoteRule) {
    setEditing(record);
    form.setFieldsValue({
      ruleSetId: Number(record.ruleSetId),
      enabled: record.enabled,
      conditionJson: JSON.stringify(record.conditionJson, null, 2),
      configJson: JSON.stringify(record.configJson, null, 2),
    });
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    const payload = {
      ruleSetId: values.ruleSetId,
      conditionJson: JSON.parse(values.conditionJson),
      configJson: JSON.parse(values.configJson),
      enabled: values.enabled,
    };
    if (editing) {
      await put(`/admin/quote-rules/${editing.id}`, payload);
      message.success('规则已更新');
    } else {
      await post('/admin/quote-rules', payload);
      message.success('规则已创建');
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
    await reload();
  }

  async function toggle(record: QuoteRule, nextEnabled: boolean) {
    await put(`/admin/quote-rules/${record.id}`, { enabled: nextEnabled });
    message.success(nextEnabled ? '规则已启用' : '规则已停用');
    await reload();
  }

  return (
    <>
      <PageHeader title="报价规则" onRefresh={reload} extra={canWrite ? <Button type="primary" onClick={openCreate}>新增规则</Button> : null} />
      <div className="filter-bar">
        <Select allowClear placeholder="规则集ID" value={ruleSetId} onChange={setRuleSetId} style={{ width: 160 }} options={ruleSetOptions} />
        <Select
          value={enabled}
          onChange={setEnabled}
          style={{ width: 140 }}
          options={[
            { label: '全部规则', value: 'all' },
            { label: '已启用', value: 'enabled' },
            { label: '已停用', value: 'disabled' },
          ]}
        />
      </div>
      <Table rowKey="id" loading={loading} dataSource={filteredData} columns={[
        { title: 'ID', dataIndex: 'id' },
        { title: '规则集ID', dataIndex: 'ruleSetId' },
        { title: '启用', dataIndex: 'enabled', render: (value: boolean) => <Tag color={value ? 'green' : 'default'}>{value ? '启用' : '停用'}</Tag> },
        { title: '条件', dataIndex: 'conditionJson', ellipsis: true, render: (value) => JSON.stringify(value) },
        { title: '配置', dataIndex: 'configJson', ellipsis: true, render: (value) => JSON.stringify(value) },
        canWrite ? {
          title: '操作',
          render: (_, record) => (
            <Space>
              <Button type="link" onClick={() => openEdit(record)}>编辑</Button>
              <Popconfirm title={record.enabled ? '确定停用该规则？' : '确定启用该规则？'} onConfirm={() => toggle(record, !record.enabled)}>
                <Button type="link" danger={record.enabled}>{record.enabled ? '停用' : '启用'}</Button>
              </Popconfirm>
            </Space>
          ),
        } : {},
      ]} />
      <Modal title={editing ? '编辑规则' : '新增规则'} open={open} onOk={submit} onCancel={() => setOpen(false)} width={760}>
        <Form form={form} layout="vertical">
          {!editing ? <Form.Item name="ruleSetId" label="规则集ID" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item> : null}
          <Form.Item name="conditionJson" label="条件 JSON" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="configJson" label="配置 JSON" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}
