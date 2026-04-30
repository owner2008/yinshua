import { App, Button, Descriptions, Empty, Form, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { put, request } from '../api';
import { getExtraFeeNotes } from '../quoteFeeNotes';
import { getQuoteRequirementItems } from '../quoteRequirements';
import { Material, Process, Product, ProductTemplate, Quote } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

const quoteStatusOptions = [
  { label: '草稿', value: 'draft', color: 'default' },
  { label: '待跟进', value: 'pending_follow', color: 'orange' },
  { label: '已联系', value: 'contacted', color: 'blue' },
  { label: '已成交', value: 'won', color: 'green' },
  { label: '已作废', value: 'void', color: 'red' },
];

export function QuotesPage() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Quote>('/admin/quotes');
  const { data: products } = useRemoteList<Product>('/admin/products');
  const { data: templates } = useRemoteList<ProductTemplate>('/admin/product-templates');
  const { data: materials } = useRemoteList<Material>('/admin/materials');
  const { data: processes } = useRemoteList<Process>('/admin/processes');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>();
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<Quote | null>(null);
  const [snapshot, setSnapshot] = useState<Record<string, unknown> | null>(null);
  const [followOpen, setFollowOpen] = useState(false);
  const [followTarget, setFollowTarget] = useState<Quote | null>(null);
  const [followForm] = Form.useForm();
  const lookup = useMemo(
    () => createQuoteLookup(products, templates, materials, processes),
    [products, templates, materials, processes],
  );

  const filteredData = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return data.filter((item) => {
      const matchedKeyword = [
        item.quoteNo,
        item.productId,
        item.productTemplateId,
        lookup.productName(item.productId),
        lookup.templateName(item.productTemplateId),
      ].some((value) => String(value).toLowerCase().includes(query));
      const matchedStatus = status ? (item.status ?? 'draft') === status : true;
      return matchedKeyword && matchedStatus;
    });
  }, [data, keyword, lookup, status]);
  const requirementItems = useMemo(() => getQuoteRequirementItems(snapshot), [snapshot]);
  const feeNotes = useMemo(() => getExtraFeeNotes(detail?.extraFees), [detail]);

  async function openDetail(record: Quote) {
    setDetailOpen(true);
    setDetailLoading(true);
    try {
      const [quoteDetail, quoteSnapshot] = await Promise.all([
        request<Quote>(`/admin/quotes/${record.quoteNo}`),
        request<Record<string, unknown>>(`/admin/quote-snapshots/${record.quoteNo}`),
      ]);
      setDetail(quoteDetail);
      setSnapshot(quoteSnapshot);
    } finally {
      setDetailLoading(false);
    }
  }

  function openFollow(record: Quote) {
    setFollowTarget(record);
    followForm.setFieldsValue({
      status: record.status ?? 'draft',
      followRemark: record.followRemark ?? '',
    });
    setFollowOpen(true);
  }

  async function submitFollow() {
    if (!followTarget) {
      return;
    }
    const values = await followForm.validateFields();
    const updated = await put<Quote>(`/admin/quotes/${followTarget.quoteNo}/status`, values);
    message.success('报价跟进状态已更新');
    setFollowOpen(false);
    setFollowTarget(null);
    followForm.resetFields();
    setDetail((current) => (current?.quoteNo === updated.quoteNo ? updated : current));
    await reload();
  }

  return (
    <div className="page-card">
      <PageHeader title="报价单" description="查看已保存报价和报价快照" onRefresh={reload} />
      <div className="filter-bar">
        <Input.Search
          allowClear
          placeholder="搜索报价单号、产品名称、产品编码或模板名称"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 360 }}
        />
        <Select
          allowClear
          placeholder="跟进状态"
          value={status}
          onChange={setStatus}
          style={{ width: 140 }}
          options={quoteStatusOptions.map(({ label, value }) => ({ label, value }))}
        />
      </div>
      <Table
        rowKey="quoteNo"
        loading={loading}
        dataSource={filteredData}
        columns={[
          { title: '报价单号', dataIndex: 'quoteNo' },
          { title: '产品', dataIndex: 'productId', render: (value: number) => lookup.productName(value), width: 180 },
          { title: '报价模板', dataIndex: 'productTemplateId', render: (value: number) => lookup.templateName(value), width: 220 },
          { title: '数量', dataIndex: 'quantity', width: 120 },
          { title: '基础成本', render: (_, r) => formatMoney(r.summary?.baseCost), width: 120 },
          { title: '最终报价', render: (_, r) => <Tag color="green">{formatMoney(r.summary?.finalPrice)}</Tag>, width: 120 },
          { title: '单价', render: (_, r) => formatMoney(r.summary?.unitPrice), width: 120 },
          { title: '跟进状态', render: (_, r) => <QuoteStatusTag status={r.status} />, width: 120 },
          { title: '跟进备注', dataIndex: 'followRemark', ellipsis: true },
          { title: '时间', dataIndex: 'createdAt', width: 190 },
          {
            title: '操作',
            width: 150,
            render: (_, record) => (
              <Space>
                <Button type="link" onClick={() => openDetail(record)}>详情</Button>
                <Button type="link" onClick={() => openFollow(record)}>跟进</Button>
              </Space>
            ),
          },
        ]}
      />
      <Modal title={`报价详情 ${detail?.quoteNo ?? ''}`} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={860}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Table
            rowKey="label"
            loading={detailLoading}
            pagination={false}
            dataSource={[
              { label: '产品', value: detail ? lookup.productName(detail.productId) : '-' },
              { label: '报价模板', value: detail ? lookup.templateName(detail.productTemplateId) : '-' },
              { label: '材料', value: lookup.quoteMaterialName(detail) },
              { label: '印刷方式', value: lookup.quotePrintMode(detail) },
              { label: '形状', value: lookup.quoteShapeType(snapshot) },
              { label: '工艺', value: lookup.quoteProcessNames(detail) },
              { label: '数量', value: detail?.quantity ?? '-' },
              { label: '基础成本', value: formatMoney(detail?.summary?.baseCost) },
              { label: '最终报价', value: formatMoney(detail?.summary?.finalPrice) },
              { label: '单价', value: formatMoney(detail?.summary?.unitPrice) },
              { label: '跟进状态', value: renderQuoteStatusText(detail?.status) },
              { label: '跟进备注', value: detail?.followRemark ?? '-' },
            ]}
            columns={[
              { title: '字段', dataIndex: 'label', width: 160 },
              { title: '值', dataIndex: 'value' },
            ]}
          />
          <div>
            <h3 style={{ margin: '0 0 12px' }}>询价需求</h3>
            {requirementItems.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无额外询价项" />
            ) : (
              <Descriptions bordered size="small" column={2}>
                {requirementItems.map((item) => (
                  <Descriptions.Item key={item.key} label={item.label}>
                    {item.value}
                  </Descriptions.Item>
                ))}
              </Descriptions>
            )}
          </div>
          <div>
            <h3 style={{ margin: '0 0 12px' }}>费用说明</h3>
            {feeNotes.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无行业附加费" />
            ) : (
              <Table
                rowKey="code"
                className="fee-note-table"
                pagination={false}
                size="small"
                dataSource={feeNotes}
                columns={[
                  { title: '费用项', dataIndex: 'title', width: 160 },
                  { title: '金额', dataIndex: 'amount', width: 120, render: (value: number) => formatMoney(value) },
                  { title: '说明', dataIndex: 'description' },
                ]}
              />
            )}
          </div>
          <pre className="json-block">{JSON.stringify(snapshot ?? detail?.snapshot ?? {}, null, 2)}</pre>
        </Space>
      </Modal>
      <Modal
        title={`报价跟进 ${followTarget?.quoteNo ?? ''}`}
        open={followOpen}
        onOk={submitFollow}
        onCancel={() => setFollowOpen(false)}
        destroyOnClose
      >
        <Form form={followForm} layout="vertical">
          <Form.Item name="status" label="跟进状态" rules={[{ required: true }]}>
            <Select options={quoteStatusOptions.map(({ label, value }) => ({ label, value }))} />
          </Form.Item>
          <Form.Item name="followRemark" label="跟进备注">
            <Input.TextArea rows={4} maxLength={500} showCount placeholder="记录客户沟通结果、下一步动作或作废原因" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function QuoteStatusTag({ status }: { status?: string }) {
  const option = quoteStatusOptions.find((item) => item.value === (status ?? 'draft'));
  return <Tag color={option?.color ?? 'default'}>{option?.label ?? status ?? '草稿'}</Tag>;
}

function renderQuoteStatusText(status?: string) {
  return quoteStatusOptions.find((item) => item.value === (status ?? 'draft'))?.label ?? status ?? '草稿';
}

function createQuoteLookup(
  products: Product[],
  templates: ProductTemplate[],
  materials: Material[],
  processes: Process[],
) {
  const productMap = new Map(products.map((item) => [Number(item.id), item]));
  const templateMap = new Map(templates.map((item) => [Number(item.id), item]));
  const materialMap = new Map(materials.map((item) => [Number(item.id), item]));
  const processMap = new Map(processes.map((item) => [item.code, item]));

  return {
    productName(productId?: number) {
      const product = productMap.get(Number(productId));
      return product ? `${product.name}${product.code ? ` / ${product.code}` : ''}` : fallbackId('产品', productId);
    },
    templateName(templateId?: number) {
      const template = templateMap.get(Number(templateId));
      return template
        ? `${template.templateName}（${template.widthMin}-${template.widthMax} x ${template.heightMin}-${template.heightMax}mm）`
        : fallbackId('模板', templateId);
    },
    quoteMaterialName(quote: Quote | null) {
      if (!quote?.material) {
        return '-';
      }
      const material = materialMap.get(Number(quote.material.materialId));
      return material
        ? [material.name, material.spec, material.code].filter(Boolean).join(' / ')
        : quote.material.materialName || fallbackId('材料', quote.material.materialId);
    },
    quotePrintMode(quote: Quote | null) {
      return renderPrintMode(quote?.print?.printMode);
    },
    quoteShapeType(snapshot: Record<string, unknown> | null) {
      const input = snapshotValue(snapshot, 'input');
      return renderShapeType(typeof input.shapeType === 'string' ? input.shapeType : undefined);
    },
    quoteProcessNames(quote: Quote | null) {
      if (!quote?.processes?.length) {
        return '-';
      }
      return quote.processes
        .map((item) => processMap.get(item.code)?.name ?? item.name ?? item.code)
        .join('、');
    },
  };
}

function snapshotValue(snapshot: Record<string, unknown> | null, key: string): Record<string, unknown> {
  const value = snapshot?.[key];
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function fallbackId(label: string, value?: number) {
  return value ? `${label} #${value}` : '-';
}

function renderPrintMode(value?: string) {
  const labels: Record<string, string> = {
    four_color: '四色印刷',
    single_color: '单色印刷',
  };
  return value ? labels[value] ?? value : '-';
}

function renderShapeType(value?: string) {
  const labels: Record<string, string> = {
    rectangle: '矩形',
    custom: '异形',
  };
  return value ? labels[value] ?? value : '-';
}

function formatMoney(value?: number) {
  return typeof value === 'number' ? `¥${value.toFixed(2)}` : '-';
}
