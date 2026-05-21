import { Alert, App, Button, Card, Col, Form, Input, InputNumber, Row, Select, Space, Statistic, Switch, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { post } from '../api';
import { Material, Process, Product, ProductTemplate } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

interface QuoteToolInput {
  productId: number;
  productTemplateId: number;
  widthMm: number;
  heightMm: number;
  quantity: number;
  materialId: number;
  printMode: string;
  shapeType: string;
  processCodes: string[];
  customerType: 'personal' | 'company';
  isProofing: boolean;
  isUrgent: boolean;
  deliveryForm?: string;
  labelingMethod?: string;
  rollDirection?: string;
  rollCoreMm?: number;
  piecesPerRoll?: number;
  adhesiveType?: string;
  usageEnvironment?: string;
  surfaceFinish?: string;
  colorMode?: string;
  hasDesignFile?: boolean;
  designFileUrl?: string;
  needDesignService?: boolean;
  needSampleApproval?: boolean;
  packagingMethod?: string;
  expectedDeliveryDate?: string;
  quoteRemark?: string;
}

interface QuoteToolResult {
  quoteNo: string;
  dimensions: {
    widthMm: number;
    heightMm: number;
    areaM2: number;
  };
  material: {
    materialName: string;
    unitPrice: number;
    cost: number;
  };
  print: {
    printMode: string;
    unitPrice: number;
    setupFee: number;
    cost: number;
  };
  processes: Array<{
    code: string;
    name: string;
    feeMode: string;
    unitPrice: number;
    setupFee: number;
    cost: number;
  }>;
  extraFees: Array<{
    code: string;
    name: string;
    amount: number;
  }>;
  summary: {
    baseCost: number;
    salePrice: number;
    memberRate: number;
    finalPrice: number;
    unitPrice: number;
    minPriceApplied: boolean;
  };
}

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

const deliveryFormOptions = ['卷装', '张装', '单张裁切', '折叠 / 风琴折'];
const labelingMethodOptions = ['手工贴标', '自动贴标', '半自动贴标'];
const rollDirectionOptions = ['上出', '下出', '左出', '右出', '内卷', '外卷'];
const adhesiveTypeOptions = ['永久胶', '可移胶', '强粘胶', '冷冻胶', '耐高温胶'];
const surfaceFinishOptions = ['哑膜', '亮膜', '哑油', '光油', '防刮', '防水', '白墨打底'];
const colorModeOptions = ['四色印刷', '单黑', '专色', '四色 + 白墨', '可变数据 / 条码'];

export function QuoteToolPage() {
  const { message } = App.useApp();
  const { data: products, loading: productsLoading, reload: reloadProducts } = useRemoteList<Product>('/admin/products');
  const { data: templates, loading: templatesLoading, reload: reloadTemplates } = useRemoteList<ProductTemplate>('/admin/product-templates');
  const { data: materials, loading: materialsLoading, reload: reloadMaterials } = useRemoteList<Material>('/admin/materials');
  const { data: processes, loading: processesLoading, reload: reloadProcesses } = useRemoteList<Process>('/admin/processes');
  const [form] = Form.useForm<QuoteToolInput>();
  const [result, setResult] = useState<QuoteToolResult | null>(null);
  const [calculating, setCalculating] = useState(false);
  const selectedProductId = Form.useWatch('productId', form);
  const selectedTemplateId = Form.useWatch('productTemplateId', form);

  const activeProducts = useMemo(() => products.filter((item) => item.status === 'active'), [products]);
  const activeTemplates = useMemo(() => templates.filter((item) => (item.status ?? 'active') === 'active'), [templates]);
  const selectedTemplate = useMemo(
    () => activeTemplates.find((item) => Number(item.id) === Number(selectedTemplateId)),
    [activeTemplates, selectedTemplateId],
  );
  const templateOptions = useMemo(
    () => activeTemplates.filter((item) => !selectedProductId || Number(item.productId) === Number(selectedProductId)),
    [activeTemplates, selectedProductId],
  );
  const materialOptions = useMemo(() => {
    const allowed = templateOptionValues(selectedTemplate, 'material').map(Number);
    return materials
      .filter((item) => item.status === 'active')
      .filter((item) => allowed.length === 0 || allowed.includes(Number(item.id)))
      .map((item) => ({ label: [item.name, item.spec, item.code].filter(Boolean).join(' / '), value: Number(item.id) }));
  }, [materials, selectedTemplate]);
  const processOptions = useMemo(() => {
    const allowed = templateOptionValues(selectedTemplate, 'process');
    return processes
      .filter((item) => item.status === 'active')
      .filter((item) => allowed.length === 0 || allowed.includes(item.code))
      .map((item) => ({ label: `${item.name} / ${item.code}`, value: item.code }));
  }, [processes, selectedTemplate]);
  const selectedPrintModes = templateOptionValues(selectedTemplate, 'print_mode');
  const selectedShapeTypes = templateOptionValues(selectedTemplate, 'shape');

  async function reloadAll() {
    await Promise.all([reloadProducts(), reloadTemplates(), reloadMaterials(), reloadProcesses()]);
  }

  function fillDefaults(template: ProductTemplate | undefined) {
    const materialIds = templateOptionValues(template, 'material').map(Number);
    const processCodes = templateOptionValues(template, 'process');
    const printModes = templateOptionValues(template, 'print_mode');
    const shapeTypes = templateOptionValues(template, 'shape');
    const firstMaterial = materials.find((item) => item.status === 'active' && materialIds.includes(Number(item.id))) ?? materials[0];
    form.setFieldsValue({
      productTemplateId: template ? Number(template.id) : undefined,
      widthMm: template ? midpoint(template.widthMin, template.widthMax) : 100,
      heightMm: template ? midpoint(template.heightMin, template.heightMax) : 80,
      quantity: template ? Math.max(Number(template.quantityMin), 1000) : 1000,
      materialId: firstMaterial ? Number(firstMaterial.id) : undefined,
      printMode: printModes[0] ?? 'four_color',
      shapeType: shapeTypes[0] ?? 'rectangle',
      processCodes: processCodes.slice(0, 2),
    });
  }

  function changeProduct(productId: number) {
    const nextTemplate = activeTemplates.find((item) => Number(item.productId) === Number(productId));
    form.setFieldsValue({ productId });
    fillDefaults(nextTemplate);
    setResult(null);
  }

  function changeTemplate(templateId: number) {
    const nextTemplate = activeTemplates.find((item) => Number(item.id) === Number(templateId));
    if (nextTemplate) {
      form.setFieldValue('productId', Number(nextTemplate.productId));
      fillDefaults(nextTemplate);
    }
    setResult(null);
  }

  async function calculate() {
    const values = await form.validateFields();
    setCalculating(true);
    try {
      const payload = {
        ...values,
        productId: Number(values.productId),
        productTemplateId: Number(values.productTemplateId),
        widthMm: Number(values.widthMm),
        heightMm: Number(values.heightMm),
        quantity: Number(values.quantity),
        materialId: Number(values.materialId),
        processCodes: Array.isArray(values.processCodes) ? values.processCodes : [],
      };
      const nextResult = await post<QuoteToolResult>('/admin/quotes/calculate', payload);
      setResult(nextResult);
      message.success('报价已生成');
    } finally {
      setCalculating(false);
    }
  }

  const loading = productsLoading || templatesLoading || materialsLoading || processesLoading;

  return (
    <div className="page-card quote-tool-page">
      <PageHeader title="报价工具" description="后台工作人员专用报价入口，按当前报价规则实时计算价格。" onRefresh={reloadAll} />
      <Alert
        type="info"
        showIcon
        className="quote-tool-alert"
        message="该工具仅对拥有“报价单查看 / admin:quote”权限的后台账号开放。"
      />
      <Row gutter={16} align="top">
        <Col xs={24} xl={16}>
          <Card title="报价参数" bordered={false}>
            <Form
              form={form}
              layout="vertical"
              initialValues={{
                customerType: 'company',
                isProofing: false,
                isUrgent: false,
                deliveryForm: '卷装',
                labelingMethod: '手工贴标',
                rollDirection: '上出',
                rollCoreMm: 76,
                piecesPerRoll: 1000,
                adhesiveType: '永久胶',
                surfaceFinish: '哑膜',
                colorMode: '四色印刷',
                hasDesignFile: false,
                needDesignService: false,
                needSampleApproval: true,
              }}
            >
              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item name="productId" label="产品" rules={[{ required: true, message: '请选择产品' }]}>
                    <Select
                      showSearch
                      loading={loading}
                      optionFilterProp="label"
                      placeholder="选择产品"
                      options={activeProducts.map((item) => ({ label: [item.name, item.code].filter(Boolean).join(' / '), value: Number(item.id) }))}
                      onChange={changeProduct}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="productTemplateId" label="报价模板" rules={[{ required: true, message: '请选择报价模板' }]}>
                    <Select
                      showSearch
                      loading={loading}
                      optionFilterProp="label"
                      placeholder="选择报价模板"
                      options={templateOptions.map((item) => ({ label: `${item.templateName} / ${item.widthMin}-${item.widthMax} x ${item.heightMin}-${item.heightMax}mm`, value: Number(item.id) }))}
                      onChange={changeTemplate}
                    />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="widthMm" label="宽度 mm" rules={[{ required: true }]}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="heightMm" label="高度 mm" rules={[{ required: true }]}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="quantity" label="数量" rules={[{ required: true }]}>
                    <InputNumber min={1} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="materialId" label="材料" rules={[{ required: true }]}>
                    <Select showSearch optionFilterProp="label" placeholder="选择材料" options={materialOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="processCodes" label="工艺">
                    <Select mode="multiple" allowClear showSearch optionFilterProp="label" placeholder="选择工艺" options={processOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="printMode" label="印刷方式" rules={[{ required: true }]}>
                    <Select options={filterBasicOptions(printModeOptions, selectedPrintModes)} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="shapeType" label="形状" rules={[{ required: true }]}>
                    <Select options={filterBasicOptions(shapeTypeOptions, selectedShapeTypes)} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="customerType" label="客户类型" rules={[{ required: true }]}>
                    <Select options={customerTypeOptions} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="deliveryForm" label="交付形式">
                    <Select options={deliveryFormOptions.map(toOption)} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="labelingMethod" label="贴标方式">
                    <Select options={labelingMethodOptions.map(toOption)} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="rollDirection" label="出标 / 卷标方向">
                    <Select options={rollDirectionOptions.map(toOption)} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="rollCoreMm" label="卷芯内径 mm">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="piecesPerRoll" label="每卷数量">
                    <InputNumber min={0} style={{ width: '100%' }} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="adhesiveType" label="胶性 / 使用环境">
                    <Select options={adhesiveTypeOptions.map(toOption)} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="surfaceFinish" label="表面处理">
                    <Select options={surfaceFinishOptions.map(toOption)} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="colorMode" label="印刷颜色">
                    <Select options={colorModeOptions.map(toOption)} />
                  </Form.Item>
                </Col>
                <Col xs={24} md={8}>
                  <Form.Item name="expectedDeliveryDate" label="期望交期">
                    <Input placeholder="如 3 天内、下周五前" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="designFileUrl" label="设计文件地址">
                    <Input placeholder="网盘、图片或文件链接" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item name="packagingMethod" label="包装与发货要求">
                    <Input placeholder="如按卷分装、纸箱、发货地区等" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="usageEnvironment" label="使用环境说明">
                    <Input placeholder="如冷冻、户外、防水、耐油等" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Form.Item name="quoteRemark" label="补充说明">
                    <Input.TextArea rows={3} placeholder="补充贴标设备、卷外径、特殊工艺、文件状态等信息" />
                  </Form.Item>
                </Col>
                <Col xs={24}>
                  <Space wrap>
                    <Form.Item name="isProofing" valuePropName="checked" className="quote-tool-switch">
                      <Switch checkedChildren="打样" unCheckedChildren="不打样" />
                    </Form.Item>
                    <Form.Item name="isUrgent" valuePropName="checked" className="quote-tool-switch">
                      <Switch checkedChildren="加急" unCheckedChildren="正常" />
                    </Form.Item>
                    <Form.Item name="hasDesignFile" valuePropName="checked" className="quote-tool-switch">
                      <Switch checkedChildren="已有文件" unCheckedChildren="无文件" />
                    </Form.Item>
                    <Form.Item name="needDesignService" valuePropName="checked" className="quote-tool-switch">
                      <Switch checkedChildren="需设计" unCheckedChildren="无需设计" />
                    </Form.Item>
                    <Form.Item name="needSampleApproval" valuePropName="checked" className="quote-tool-switch">
                      <Switch checkedChildren="样稿确认" unCheckedChildren="无需样稿" />
                    </Form.Item>
                  </Space>
                </Col>
              </Row>
              <Button type="primary" loading={calculating} onClick={calculate}>
                生成报价
              </Button>
            </Form>
          </Card>
        </Col>
        <Col xs={24} xl={8}>
          <QuoteResultCard result={result} />
        </Col>
      </Row>
    </div>
  );
}

function QuoteResultCard({ result }: { result: QuoteToolResult | null }) {
  if (!result) {
    return (
      <Card title="报价结果" bordered={false} className="quote-tool-result">
        <div className="quote-tool-empty">填写参数后生成报价</div>
      </Card>
    );
  }

  const costRows = [
    { key: 'material', name: '材料成本', amount: result.material.cost },
    { key: 'print', name: '印刷成本', amount: result.print.cost },
    ...result.processes.map((item) => ({ key: item.code, name: item.name, amount: item.cost })),
    ...result.extraFees.map((item) => ({ key: item.code, name: item.name, amount: item.amount })),
  ];

  return (
    <Card title="报价结果" bordered={false} className="quote-tool-result">
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <Statistic title={`临时报价号 ${result.quoteNo}`} value={result.summary.finalPrice} precision={2} prefix="¥" />
        <Space wrap>
          <Tag color="blue">单价 ¥{result.summary.unitPrice.toFixed(4)}</Tag>
          <Tag color={result.summary.minPriceApplied ? 'orange' : 'green'}>
            {result.summary.minPriceApplied ? '已触发最低价' : '未触发最低价'}
          </Tag>
        </Space>
        <Table
          size="small"
          pagination={false}
          rowKey="key"
          dataSource={costRows}
          columns={[
            { title: '费用项', dataIndex: 'name' },
            { title: '金额', dataIndex: 'amount', width: 110, render: (value: number) => `¥${value.toFixed(2)}` },
          ]}
        />
      </Space>
    </Card>
  );
}

function templateOptionValues(template: ProductTemplate | undefined, type: 'material' | 'process' | 'print_mode' | 'shape'): string[] {
  return template?.options
    ?.filter((item) => item.optionType === type)
    .map((item) => item.optionValue) ?? [];
}

function filterBasicOptions(options: Array<{ label: string; value: string }>, allowed: string[]) {
  return allowed.length > 0 ? options.filter((item) => allowed.includes(item.value)) : options;
}

function midpoint(min: string | number, max: string | number) {
  return Math.round((Number(min) + Number(max)) / 2);
}

function toOption(value: string) {
  return { label: value, value };
}
