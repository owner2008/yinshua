import { App, Button, Descriptions, Divider, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tabs, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { hasAdminPermission, post, put } from '../api';
import { Material, Process, Product, ProductTemplate, QuotePreviewResult, QuoteRule, QuoteRuleSet } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

const sceneOptions = [
  { label: '普通客户', value: 'retail' },
  { label: '企业客户', value: 'enterprise' },
  { label: '批量客户', value: 'bulk' },
  { label: '打样场景', value: 'proofing' },
];

const customerTypeOptions = [
  { label: '个人客户', value: 'personal' },
  { label: '企业客户', value: 'company' },
];

const printModeOptions = [
  { label: '四色印刷', value: 'four_color' },
  { label: '单色印刷', value: 'single_color' },
];

const shapeTypeOptions = [
  { label: '矩形', value: 'rectangle' },
  { label: '异形', value: 'custom' },
];

const quoteConditionFieldNames = new Set([
  'quantityRange',
  'widthRange',
  'heightRange',
  'customerTypes',
]);

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
  const [status, setStatus] = useState<string>('active');
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
    message.success('规则集已删除');
    await reload();
  }

  async function restore(record: QuoteRuleSet) {
    await put(`/admin/quote-rule-sets/${record.id}`, { status: 'active' });
    message.success('规则集已恢复');
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
              {record.status === 'active' ? (
                <Popconfirm title="确定删除该规则集？" description="删除后默认列表不再显示，可通过状态筛选找回。" onConfirm={() => disable(record)}>
                  <Button type="link" danger>删除</Button>
                </Popconfirm>
              ) : (
                <Popconfirm title="确定恢复该规则集？" onConfirm={() => restore(record)}>
                  <Button type="link">恢复</Button>
                </Popconfirm>
              )}
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
  const { data: products } = useRemoteList<Product>('/admin/products');
  const { data: templates } = useRemoteList<ProductTemplate>('/admin/product-templates');
  const { data: materials } = useRemoteList<Material>('/admin/materials');
  const { data: processes } = useRemoteList<Process>('/admin/processes');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<QuoteRule | null>(null);
  const [enabled, setEnabled] = useState<string>('enabled');
  const [ruleSetId, setRuleSetId] = useState<string>();
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewResult, setPreviewResult] = useState<QuotePreviewResult | null>(null);
  const [form] = Form.useForm();
  const [previewForm] = Form.useForm();
  const previewProductId = Form.useWatch('productId', previewForm);
  const previewTemplateId = Form.useWatch('productTemplateId', previewForm);
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
  const activeProducts = useMemo(() => products.filter((item) => item.status === 'active'), [products]);
  const activeTemplates = useMemo(() => templates.filter((item) => (item.status ?? 'active') === 'active'), [templates]);
  const activeMaterials = useMemo(() => materials.filter((item) => item.status === 'active'), [materials]);
  const activeProcesses = useMemo(() => processes.filter((item) => item.status === 'active'), [processes]);
  const selectedTemplate = useMemo(
    () => activeTemplates.find((item) => Number(item.id) === Number(previewTemplateId)),
    [activeTemplates, previewTemplateId],
  );
  const allowedMaterialIds = useMemo(() => templateOptionValues(selectedTemplate, 'material').map(Number), [selectedTemplate]);
  const allowedProcessCodes = useMemo(() => templateOptionValues(selectedTemplate, 'process'), [selectedTemplate]);
  const allowedPrintModes = useMemo(() => templateOptionValues(selectedTemplate, 'print_mode'), [selectedTemplate]);
  const allowedShapeTypes = useMemo(() => templateOptionValues(selectedTemplate, 'shape'), [selectedTemplate]);
  const previewProductOptions = useMemo(
    () => activeProducts.map((item) => ({ label: formatProductOption(item), value: Number(item.id) })),
    [activeProducts],
  );
  const previewTemplateOptions = useMemo(
    () =>
      activeTemplates
        .filter((item) => !previewProductId || Number(item.productId) === Number(previewProductId))
        .map((item) => ({ label: formatTemplateOption(item), value: Number(item.id) })),
    [activeTemplates, previewProductId],
  );
  const previewMaterialOptions = useMemo(
    () =>
      activeMaterials
        .filter((item) => allowedMaterialIds.length === 0 || allowedMaterialIds.includes(Number(item.id)))
        .map((item) => ({ label: formatMaterialOption(item), value: Number(item.id) })),
    [activeMaterials, allowedMaterialIds],
  );
  const previewProcessOptions = useMemo(
    () =>
      activeProcesses
        .filter((item) => allowedProcessCodes.length === 0 || allowedProcessCodes.includes(item.code))
        .map((item) => ({ label: `${item.name}（${item.code}）`, value: item.code })),
    [activeProcesses, allowedProcessCodes],
  );
  const previewPrintModeOptions = useMemo(
    () => printModeOptions.filter((item) => allowedPrintModes.length === 0 || allowedPrintModes.includes(item.value)),
    [allowedPrintModes],
  );
  const previewShapeTypeOptions = useMemo(
    () => shapeTypeOptions.filter((item) => allowedShapeTypes.length === 0 || allowedShapeTypes.includes(item.value)),
    [allowedShapeTypes],
  );

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({
      ruleSetId: ruleSetOptions[0]?.value ?? 1,
      enabled: true,
      quantityMin: 100,
      quantityMax: 100000,
      widthMin: 20,
      widthMax: 500,
      heightMin: 20,
      heightMax: 500,
      customerTypes: ['personal'],
      conditionJsonExtra: '{}',
      configJsonExtra: '{}',
      ...getDefaultQuoteConfigValues(),
    });
    setOpen(true);
  }

  function openPreview() {
    setPreviewResult(null);
    const defaultProduct = activeProducts[0];
    const defaultTemplate = activeTemplates.find((item) => Number(item.productId) === Number(defaultProduct?.id)) ?? activeTemplates[0];
    const defaultMaterialIds = templateOptionValues(defaultTemplate, 'material').map(Number);
    const defaultProcessCodes = templateOptionValues(defaultTemplate, 'process');
    const defaultPrintModes = templateOptionValues(defaultTemplate, 'print_mode');
    const defaultShapeTypes = templateOptionValues(defaultTemplate, 'shape');
    const defaultMaterial = activeMaterials.find((item) => defaultMaterialIds.includes(Number(item.id))) ?? activeMaterials[0];
    previewForm.resetFields();
    previewForm.setFieldsValue({
      productId: defaultProduct ? Number(defaultProduct.id) : 1,
      productTemplateId: defaultTemplate ? Number(defaultTemplate.id) : 1,
      widthMm: 100,
      heightMm: 80,
      quantity: 5000,
      materialId: defaultMaterial ? Number(defaultMaterial.id) : 2,
      printMode: defaultPrintModes[0] ?? 'four_color',
      shapeType: defaultShapeTypes[0] ?? 'rectangle',
      processCodes: defaultProcessCodes.slice(0, 2),
      customerType: 'company',
      isProofing: false,
      isUrgent: false,
    });
    setPreviewOpen(true);
  }

  function changePreviewProduct(productId: number) {
    const nextTemplate = activeTemplates.find((item) => Number(item.productId) === Number(productId));
    previewForm.setFieldsValue({
      productTemplateId: nextTemplate ? Number(nextTemplate.id) : undefined,
      materialId: undefined,
      processCodes: [],
      printMode: undefined,
      shapeType: undefined,
    });
    if (nextTemplate) {
      fillPreviewTemplateDefaults(nextTemplate);
    }
  }

  function changePreviewTemplate(templateId: number) {
    const nextTemplate = activeTemplates.find((item) => Number(item.id) === Number(templateId));
    if (nextTemplate) {
      previewForm.setFieldValue('productId', Number(nextTemplate.productId));
      fillPreviewTemplateDefaults(nextTemplate);
    }
  }

  function fillPreviewTemplateDefaults(template: ProductTemplate) {
    const materialIds = templateOptionValues(template, 'material').map(Number);
    const processCodes = templateOptionValues(template, 'process');
    const printModes = templateOptionValues(template, 'print_mode');
    const shapeTypes = templateOptionValues(template, 'shape');
    const firstMaterial = activeMaterials.find((item) => materialIds.includes(Number(item.id))) ?? activeMaterials[0];
    previewForm.setFieldsValue({
      materialId: firstMaterial ? Number(firstMaterial.id) : undefined,
      processCodes: processCodes.slice(0, 2),
      printMode: printModes[0] ?? 'four_color',
      shapeType: shapeTypes[0] ?? 'rectangle',
    });
  }

  function openEdit(record: QuoteRule) {
    setEditing(record);
    const configJson = record.configJson ?? {};
    const conditionJson = record.conditionJson ?? {};
    form.setFieldsValue({
      ruleSetId: Number(record.ruleSetId),
      enabled: record.enabled,
      ...getConditionFormValues(conditionJson),
      conditionJsonExtra: JSON.stringify(getExtraConditionJson(conditionJson), null, 2),
      configJsonExtra: JSON.stringify(getExtraQuoteConfig(configJson), null, 2),
      ...getQuoteConfigFormValues(configJson),
    });
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    const extraCondition = JSON.parse(values.conditionJsonExtra || '{}') as Record<string, unknown>;
    const extraConfig = JSON.parse(values.configJsonExtra || '{}') as Record<string, unknown>;
    const payload = {
      ruleSetId: values.ruleSetId,
      conditionJson: {
        ...extraCondition,
        ...getConditionPayload(values),
      },
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
    message.success(nextEnabled ? '规则已恢复' : '规则已删除');
    await reload();
  }

  async function submitPreview() {
    const values = await previewForm.validateFields();
    const payload = {
      ...values,
      processCodes: Array.isArray(values.processCodes) ? values.processCodes : [],
    };
    setPreviewLoading(true);
    try {
      const result = await post<QuotePreviewResult>('/admin/quotes/preview', payload);
      setPreviewResult(result);
      message.success('试算完成，已展示命中规则');
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <>
      <PageHeader
        title="报价规则"
        onRefresh={reloadAll}
        extra={canWrite ? (
          <Space>
            <Button onClick={openPreview}>规则试算</Button>
            <Button type="primary" onClick={openCreate}>新增规则</Button>
          </Space>
        ) : null}
      />
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
        { title: '适用条件', dataIndex: 'conditionJson', ellipsis: true, render: renderConditionSummary },
        { title: '价格配置', dataIndex: 'configJson', ellipsis: true, render: renderQuoteConfigSummary },
        canWrite ? {
          title: '操作',
          render: (_, record) => (
            <Space>
              <Button type="link" onClick={() => openEdit(record)}>编辑</Button>
              <Popconfirm
                title={record.enabled ? '确定删除该规则？' : '确定恢复该规则？'}
                description={record.enabled ? '删除后默认列表不再显示，可通过状态筛选找回。' : undefined}
                onConfirm={() => toggle(record, !record.enabled)}
              >
                <Button type="link" danger={record.enabled}>{record.enabled ? '删除' : '恢复'}</Button>
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
          <Divider orientation="left">适用条件</Divider>
          <div className="quote-rule-help">
            这里决定“什么样的报价请求会命中这条规则”。如果多个规则都满足条件，系统会优先使用规则集优先级更高的配置。
          </div>
          <div className="quote-rule-config-grid">
            <Form.Item name="quantityMin" label="最小数量" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="quantityMax" label="最大数量" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="widthMin" label="最小宽度 mm" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="widthMax" label="最大宽度 mm" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="heightMin" label="最小高度 mm" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="heightMax" label="最大高度 mm" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="customerTypes" label="适用客户类型" rules={[{ required: true }]}>
            <Select mode="multiple" options={customerTypeOptions} />
          </Form.Item>
          <Form.Item
            name="conditionJsonExtra"
            label="高级匹配条件 JSON"
            tooltip="保留暂未做成表单的匹配条件。当前后端只识别上方数量、尺寸和客户类型；这里主要给后续扩展预留。"
            rules={[{ required: true }, { validator: validateJsonObject }]}
          >
            <Input.TextArea rows={2} />
          </Form.Item>
          <Divider orientation="left">基础报价配置</Divider>
          <div className="quote-rule-config-grid">
            {baseQuoteConfigFields.map((field) => (
              <Form.Item key={field.name} name={field.name} label={field.label} rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} step={field.step} />
              </Form.Item>
            ))}
          </div>
          <QuoteFormulaGuide />
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
            label="高级扩展配置 JSON"
            tooltip="保留暂未做成表单的价格配置。上方已有的损耗、利润、最低报价和行业附加费会自动覆盖同名字段。"
            rules={[{ required: true }, { validator: validateJsonObject }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="enabled" label="启用" valuePropName="checked"><Switch /></Form.Item>
        </Form>
      </Modal>
      <Modal
        title="报价规则试算 / 命中预览"
        open={previewOpen}
        onOk={submitPreview}
        confirmLoading={previewLoading}
        okText="开始试算"
        cancelText="关闭"
        onCancel={() => setPreviewOpen(false)}
        width={920}
      >
        <Form form={previewForm} layout="vertical">
          <div className="quote-rule-config-grid">
            <Form.Item name="productId" label="产品" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="选择产品"
                options={previewProductOptions}
                onChange={changePreviewProduct}
              />
            </Form.Item>
            <Form.Item name="productTemplateId" label="报价模板" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="选择报价模板"
                options={previewTemplateOptions}
                onChange={changePreviewTemplate}
              />
            </Form.Item>
            <Form.Item name="widthMm" label="宽度 mm" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="heightMm" label="高度 mm" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
              <InputNumber min={1} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="materialId" label="材料" rules={[{ required: true }]}>
              <Select
                showSearch
                optionFilterProp="label"
                placeholder="选择材料"
                options={previewMaterialOptions}
              />
            </Form.Item>
          </div>
          <div className="quote-rule-config-grid">
            <Form.Item name="printMode" label="印刷方式" rules={[{ required: true }]}>
              <Select options={previewPrintModeOptions} />
            </Form.Item>
            <Form.Item name="shapeType" label="形状" rules={[{ required: true }]}>
              <Select options={previewShapeTypeOptions} />
            </Form.Item>
            <Form.Item name="customerType" label="客户类型" rules={[{ required: true }]}>
              <Select options={customerTypeOptions} />
            </Form.Item>
            <Form.Item name="processCodes" label="工艺">
              <Select
                mode="multiple"
                allowClear
                showSearch
                optionFilterProp="label"
                placeholder="选择需要参与试算的工艺"
                options={previewProcessOptions}
              />
            </Form.Item>
            <Form.Item name="isProofing" label="是否打样" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item name="isUrgent" label="是否加急" valuePropName="checked">
              <Switch />
            </Form.Item>
          </div>
        </Form>
        {previewResult ? renderPreviewResult(previewResult) : null}
      </Modal>
    </>
  );
}

function renderPreviewResult(preview: QuotePreviewResult) {
  const { matchedRule, result } = preview;
  const ruleConfig = matchedRule.config ?? {};

  return (
    <div className="quote-preview-result">
      <Divider orientation="left">命中规则</Divider>
      <Descriptions bordered size="small" column={3}>
        <Descriptions.Item label="规则集编号">{matchedRule.ruleSetId}</Descriptions.Item>
        <Descriptions.Item label="规则编号">{matchedRule.ruleId ?? '-'}</Descriptions.Item>
        <Descriptions.Item label="版本">{matchedRule.versionNo}</Descriptions.Item>
        <Descriptions.Item label="损耗系数">{formatRate(ruleConfig.lossRate)}</Descriptions.Item>
        <Descriptions.Item label="利润系数">{formatRate(ruleConfig.profitRate)}</Descriptions.Item>
        <Descriptions.Item label="会员系数">{formatRate(ruleConfig.memberRate)}</Descriptions.Item>
        <Descriptions.Item label="最低报价">{formatMoney(ruleConfig.minPrice)}</Descriptions.Item>
        <Descriptions.Item label="包装费">{formatMoney(ruleConfig.packageFee)}</Descriptions.Item>
        <Descriptions.Item label="加急费率">{formatPercent(ruleConfig.urgentFeeRate)}</Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">报价拆分</Divider>
      <Descriptions bordered size="small" column={3}>
        <Descriptions.Item label="面积">{result.dimensions.areaM2.toFixed(4)} m2</Descriptions.Item>
        <Descriptions.Item label="材料费">{formatMoney(result.material.cost)}</Descriptions.Item>
        <Descriptions.Item label="印刷费">{formatMoney(result.print.cost)}</Descriptions.Item>
        <Descriptions.Item label="基础成本">{formatMoney(result.summary.baseCost)}</Descriptions.Item>
        <Descriptions.Item label="销售价">{formatMoney(result.summary.salePrice)}</Descriptions.Item>
        <Descriptions.Item label="最终报价">{formatMoney(result.summary.finalPrice)}</Descriptions.Item>
        <Descriptions.Item label="单价">{formatMoney(result.summary.unitPrice)}</Descriptions.Item>
        <Descriptions.Item label="最低价保护">{result.summary.minPriceApplied ? '已触发' : '未触发'}</Descriptions.Item>
      </Descriptions>

      <Table
        size="small"
        pagination={false}
        rowKey={(record) => record.code}
        dataSource={result.processes}
        columns={[
          { title: '工艺项目', render: (_, record) => `${record.name}（${record.code}）` },
          { title: '计费方式', dataIndex: 'feeMode', render: renderFeeMode },
          { title: '单价', dataIndex: 'unitPrice', render: formatMoney },
          { title: '开机费', dataIndex: 'setupFee', render: formatMoney },
          { title: '费用', dataIndex: 'cost', render: formatMoney },
        ]}
        locale={{ emptyText: '未选择额外工艺' }}
        className="quote-preview-table"
      />
      <Table
        size="small"
        pagination={false}
        rowKey={(record) => record.code}
        dataSource={result.extraFees ?? []}
        columns={[
          { title: '附加项', dataIndex: 'name' },
          { title: '费用', dataIndex: 'amount', render: formatMoney },
        ]}
        locale={{ emptyText: '没有附加费用' }}
        className="quote-preview-table"
      />
    </div>
  );
}

function QuoteFormulaGuide() {
  return (
    <div className="quote-formula-guide">
      <div className="quote-formula-title">报价计算公式</div>
      <ol className="quote-formula-list">
        <li>
          <span>面积</span>
          <code>宽度 mm x 高度 mm / 1,000,000</code>
        </li>
        <li>
          <span>材料费</span>
          <code>面积 x 数量 x 材料单价 x 损耗系数</code>
        </li>
        <li>
          <span>印刷费</span>
          <code>数量 x 印刷单价 + 开机费</code>
        </li>
        <li>
          <span>工艺费</span>
          <code>按选择的覆膜、模切、烫金、UV 等工艺逐项累加</code>
        </li>
        <li>
          <span>附加费</span>
          <code>包装费 + 打样费 + 加急费 + 白墨/分卷/裁切等行业附加费</code>
        </li>
        <li>
          <span>基础成本</span>
          <code>材料费 + 印刷费 + 工艺费 + 附加费</code>
        </li>
        <li>
          <span>销售价</span>
          <code>基础成本 x 利润系数</code>
        </li>
        <li>
          <span>最终报价</span>
          <code>max(销售价 x 会员系数, 最低报价)</code>
        </li>
        <li>
          <span>单价</span>
          <code>最终报价 / 数量</code>
        </li>
      </ol>
      <div className="quote-formula-note">
        这里的系数和附加费只影响新报价。已保存的历史报价会继续使用生成当时的快照。
      </div>
    </div>
  );
}

function getConditionFormValues(conditionJson: Record<string, unknown>) {
  const quantityRange = numberRange(conditionJson.quantityRange, [100, 100000]);
  const widthRange = numberRange(conditionJson.widthRange, [20, 500]);
  const heightRange = numberRange(conditionJson.heightRange, [20, 500]);
  const customerTypes = Array.isArray(conditionJson.customerTypes)
    ? conditionJson.customerTypes.filter((item): item is string => typeof item === 'string')
    : ['personal'];

  return {
    quantityMin: quantityRange[0],
    quantityMax: quantityRange[1],
    widthMin: widthRange[0],
    widthMax: widthRange[1],
    heightMin: heightRange[0],
    heightMax: heightRange[1],
    customerTypes,
  };
}

function getConditionPayload(values: Record<string, unknown>) {
  return {
    quantityRange: [Number(values.quantityMin), Number(values.quantityMax)],
    widthRange: [Number(values.widthMin), Number(values.widthMax)],
    heightRange: [Number(values.heightMin), Number(values.heightMax)],
    customerTypes: Array.isArray(values.customerTypes) ? values.customerTypes : [],
  };
}

function getExtraConditionJson(conditionJson: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(conditionJson).filter(([key]) => !quoteConditionFieldNames.has(key)),
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

function renderConditionSummary(value: Record<string, unknown>) {
  const formValues = getConditionFormValues(value ?? {});
  const customers = formValues.customerTypes
    .map((type) => customerTypeOptions.find((option) => option.value === type)?.label ?? type)
    .join('、');
  return `数量 ${formValues.quantityMin}-${formValues.quantityMax}，宽 ${formValues.widthMin}-${formValues.widthMax}mm，高 ${formValues.heightMin}-${formValues.heightMax}mm，客户：${customers || '不限'}`;
}

function renderQuoteConfigSummary(value: Record<string, unknown>) {
  const config = getQuoteConfigFormValues(value ?? {});
  return `损耗 ${config.lossRate}，利润 ${config.profitRate}，会员 ${config.memberRate}，最低 ${config.minPrice} 元`;
}

function numberRange(value: unknown, fallback: [number, number]): [number, number] {
  if (!Array.isArray(value) || value.length < 2) {
    return fallback;
  }
  const [min, max] = value;
  return typeof min === 'number' && typeof max === 'number' ? [min, max] : fallback;
}

function templateOptionValues(template: ProductTemplate | undefined, type: 'material' | 'process' | 'print_mode' | 'shape'): string[] {
  return template?.options
    ?.filter((item) => item.optionType === type)
    .map((item) => item.optionValue) ?? [];
}

function formatProductOption(product: Product): string {
  return `${product.name}${product.code ? ` / ${product.code}` : ''}`;
}

function formatTemplateOption(template: ProductTemplate): string {
  return `${template.templateName} / ${template.widthMin}-${template.widthMax} x ${template.heightMin}-${template.heightMax}mm / ${template.quantityMin}-${template.quantityMax}个`;
}

function formatMaterialOption(material: Material): string {
  const parts = [material.name, material.spec, material.code].filter(Boolean);
  return parts.join(' / ');
}

function renderFeeMode(value: string): string {
  const labels: Record<string, string> = {
    fixed: '固定费用',
    per_area: '按面积计费',
    per_qty: '按数量计费',
    fixed_plus_qty: '开机费 + 按数量计费',
    fixed_plus_area: '开机费 + 按面积计费',
  };
  return labels[value] ?? value ?? '-';
}

function formatMoney(value: unknown): string {
  return typeof value === 'number' ? `¥${value.toFixed(2)}` : '-';
}

function formatRate(value: unknown): string {
  return typeof value === 'number' ? value.toString() : '-';
}

function formatPercent(value: unknown): string {
  return typeof value === 'number' ? `${(value * 100).toFixed(1)}%` : '-';
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
