import { App, Button, Divider, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tabs, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { hasAdminPermission, post, put } from '../api';
import { QuoteRule, QuoteRuleSet } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

const sceneOptions = [
  { label: '普通客户', value: 'retail' },
  { label: '企业客户', value: 'enterprise' },
  { label: '批量客户', value: 'bulk' },
  { label: '打样场景', value: 'proofing' },
];

const baseQuoteConfigFields = [
  { name: 'lossRate', label: '损耗系数', step: 0.01, defaultValue: 1.08 },
  { name: 'profitRate', label: '利润系数', step: 0.01, defaultValue: 1.35 },
  { name: 'memberRate', label: '会员系数', step: 0.01, defaultValue: 1 },
  { name: 'minPrice', label: '最低报价', step: 1, defaultValue: 300 },
  { name: 'packageFee', label: '包装费', step: 1, defaultValue: 20 },
  { name: 'urgentFeeRate', label: '加急费率', step: 0.01, defaultValue: 0.15 },
];

const requirementFeeConfigFields = [
  { name: 'whiteInkUnitPrice', label: '白墨面积单价', step: 0.01, defaultValue: 0.35 },
  { name: 'whiteInkSetupFee', label: '白墨开机费', step: 1, defaultValue: 50 },
  { name: 'whiteInkMinFee', label: '白墨最低费', step: 1, defaultValue: 80 },
  { name: 'variableDataUnitPrice', label: '可变数据单价', step: 0.001, defaultValue: 0.006 },
  { name: 'variableDataMinFee', label: '可变数据最低费', step: 1, defaultValue: 80 },
  { name: 'protectiveFinishUnitPrice', label: '防护处理面积单价', step: 0.01, defaultValue: 0.08 },
  { name: 'protectiveFinishMinFee', label: '防护处理最低费', step: 1, defaultValue: 30 },
  { name: 'rollSplitFeePerRoll', label: '分卷每卷费用', step: 1, defaultValue: 2 },
  { name: 'sheetCuttingFee', label: '单张裁切整理费', step: 1, defaultValue: 30 },
  { name: 'fanFoldFee', label: '折叠整理费', step: 1, defaultValue: 50 },
];

const quoteConfigFields = [...baseQuoteConfigFields, ...requirementFeeConfigFields];
const quoteConfigFieldNames = new Set(quoteConfigFields.map((field) => field.name));

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
          placeholder="搜索名称、场景、版本或模板编号"
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
        { title: '编号', dataIndex: 'id' },
        { title: '模板编号', dataIndex: 'productTemplateId' },
        { title: '名称', dataIndex: 'name' },
        { title: '场景', dataIndex: 'scene', render: renderScene },
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
          {!editing ? <Form.Item name="productTemplateId" label="模板编号" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} /></Form.Item> : null}
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="scene" label="场景" rules={[{ required: true }]}>
            <Select options={sceneOptions} />
          </Form.Item>
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

function renderScene(value?: string): string {
  return sceneOptions.find((option) => option.value === value)?.label ?? value ?? '-';
}

function formatRuleSetOption(ruleSet: QuoteRuleSet): string {
  return `#${ruleSet.id} ${ruleSet.name} / ${renderScene(ruleSet.scene)} / 模板 ${ruleSet.productTemplateId}`;
}

function findRuleSetLabel(ruleSets: QuoteRuleSet[], ruleSetId: string | number): string {
  const ruleSet = ruleSets.find((item) => String(item.id) === String(ruleSetId));
  return ruleSet ? formatRuleSetOption(ruleSet) : String(ruleSetId);
}

function Rules() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<QuoteRule>('/admin/quote-rules');
  const { data: ruleSets, reload: reloadRuleSets } = useRemoteList<QuoteRuleSet>('/admin/quote-rule-sets');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuoteRule | null>(null);
  const [enabled, setEnabled] = useState<string>('all');
  const [ruleSetId, setRuleSetId] = useState<string>();
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:quote-rule');
  const reloadAll = () => Promise.all([reload(), reloadRuleSets()]);

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedEnabled = enabled === 'enabled' ? item.enabled : enabled === 'disabled' ? !item.enabled : true;
      const matchedRuleSet = ruleSetId ? String(item.ruleSetId) === ruleSetId : true;
      return matchedEnabled && matchedRuleSet;
    });
  }, [data, enabled, ruleSetId]);

  const ruleSetOptions = useMemo(
    () =>
      ruleSets.map((item) => ({
        label: formatRuleSetOption(item),
        value: Number(item.id),
      })),
    [ruleSets],
  );
  const ruleSetFilterOptions = useMemo(
    () => ruleSetOptions.map((item) => ({ ...item, value: String(item.value) })),
    [ruleSetOptions],
  );

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      ruleSetId: ruleSetOptions[0]?.value ?? 1,
      enabled: true,
      conditionJson: '{"quantityRange":[100,100000],"widthRange":[20,500],"heightRange":[20,500],"customerTypes":["personal"]}',
      configJsonExtra: '{}',
      ...getDefaultQuoteConfigValues(),
    });
    setOpen(true);
  }

  function openEdit(record: QuoteRule) {
    setEditing(record);
    const configJson = record.configJson ?? {};
    form.setFieldsValue({
      ruleSetId: Number(record.ruleSetId),
      enabled: record.enabled,
      conditionJson: JSON.stringify(record.conditionJson, null, 2),
      configJsonExtra: JSON.stringify(getExtraQuoteConfig(configJson), null, 2),
      ...getQuoteConfigFormValues(configJson),
    });
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    const extraConfig = JSON.parse(values.configJsonExtra || '{}') as Record<string, unknown>;
    const payload = {
      ruleSetId: values.ruleSetId,
      conditionJson: JSON.parse(values.conditionJson),
      configJson: {
        ...extraConfig,
        ...getQuoteConfigPayload(values),
      },
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
    await Promise.all([reload(), reloadRuleSets()]);
  }

  async function toggle(record: QuoteRule, nextEnabled: boolean) {
    await put(`/admin/quote-rules/${record.id}`, { enabled: nextEnabled });
    message.success(nextEnabled ? '规则已启用' : '规则已停用');
    await reload();
  }

  return (
    <>
      <PageHeader title="报价规则" onRefresh={reloadAll} extra={canWrite ? <Button type="primary" onClick={openCreate}>新增规则</Button> : null} />
      <div className="filter-bar">
        <Select allowClear placeholder="规则集" value={ruleSetId} onChange={setRuleSetId} style={{ width: 260 }} options={ruleSetFilterOptions} />
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
        { title: '编号', dataIndex: 'id' },
        { title: '规则集', dataIndex: 'ruleSetId', render: (value) => findRuleSetLabel(ruleSets, value) },
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
          {!editing ? (
            <Form.Item name="ruleSetId" label="规则集" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="选择规则集"
                options={ruleSetOptions}
              />
            </Form.Item>
          ) : null}
          <Form.Item name="conditionJson" label="条件配置" rules={[{ required: true }]}><Input.TextArea rows={4} /></Form.Item>
          <Divider orientation="left">基础报价配置</Divider>
          <div className="quote-rule-config-grid">
            {baseQuoteConfigFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step={field.step} />
              </Form.Item>
            ))}
          </div>
          <Divider orientation="left">行业询价附加费</Divider>
          <div className="quote-rule-config-grid">
            {requirementFeeConfigFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step={field.step} />
              </Form.Item>
            ))}
          </div>
          <Form.Item
            name="configJsonExtra"
            label="其他配置 JSON"
            tooltip="保留未结构化展示的扩展配置，保存时会与上方字段合并。"
            rules={[{ required: true }, { validator: validateJsonObject }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function getDefaultQuoteConfigValues() {
  return Object.fromEntries(quoteConfigFields.map((field) => [field.name, field.defaultValue]));
}

function getQuoteConfigFormValues(configJson: Record<string, unknown>) {
  return Object.fromEntries(
    quoteConfigFields.map((field) => [
      field.name,
      typeof configJson[field.name] === 'number' ? configJson[field.name] : field.defaultValue,
    ]),
  );
}

function getQuoteConfigPayload(values: Record<string, unknown>) {
  return Object.fromEntries(
    quoteConfigFields.map((field) => [
      field.name,
      typeof values[field.name] === 'number' ? values[field.name] : field.defaultValue,
    ]),
  );
}

function getExtraQuoteConfig(configJson: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(configJson).filter(([key]) => !quoteConfigFieldNames.has(key)),
  );
}

function validateJsonObject(_: unknown, value?: string) {
  try {
    const parsed = JSON.parse(value || '{}');
    if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
      return Promise.reject(new Error('请输入 JSON 对象'));
    }
    return Promise.resolve();
  } catch {
    return Promise.reject(new Error('JSON 格式不正确'));
  }
}
