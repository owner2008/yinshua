import { App, Button, Form, Image, Input, InputNumber, Modal, Popconfirm, Select, Space, Switch, Table, Tabs, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { hasAdminPermission, post, put } from '../api';
import { Product, ProductCategory, ProductTemplate } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

export function ProductsPage() {
  return (
    <div className="page-card">
      <Tabs
        items={[
          { key: 'products', label: '产品', children: <ProductList /> },
          { key: 'templates', label: '报价模板', children: <TemplateList /> },
        ]}
      />
    </div>
  );
}

function ProductList() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Product>('/admin/products');
  const { data: categories } = useRemoteList<ProductCategory>('/admin/product-categories');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>();
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:product');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedKeyword = [item.name, item.code, item.description].some((value) =>
        value?.toLowerCase().includes(keyword.trim().toLowerCase()),
      );
      const matchedStatus = status ? item.status === status : true;
      return matchedKeyword && matchedStatus;
    });
  }, [data, keyword, status]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: 'active' });
    setOpen(true);
  }

  function openEdit(record: Product) {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      categoryId: record.categoryId ? Number(record.categoryId) : undefined,
      gallery: (record.galleryJson ?? []).join('\n'),
    });
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    const payload = {
      ...values,
      categoryId: values.categoryId ?? null,
      gallery: parseLineList(values.gallery),
    };
    if (editing) {
      await put(`/admin/products/${editing.id}`, payload);
      message.success('产品已更新');
    } else {
      await post('/admin/products', payload);
      message.success('产品已创建');
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
    await reload();
  }

  async function disable(record: Product) {
    await put(`/admin/products/${record.id}`, { status: 'inactive' });
    message.success('产品已停用');
    await reload();
  }

  return (
    <>
      <PageHeader
        title="产品管理"
        description="维护前台展示的产品档案"
        onRefresh={reload}
        extra={canWrite ? <Button type="primary" onClick={openCreate}>新增产品</Button> : null}
      />
      <div className="filter-bar">
        <Input.Search
          allowClear
          placeholder="搜索产品名称、编码或说明"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 280 }}
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
      <Table
        rowKey="id"
        loading={loading}
        dataSource={filteredData}
        columns={[
          { title: '编号', dataIndex: 'id', width: 90 },
          {
            title: '封面',
            dataIndex: 'coverImage',
            width: 84,
            render: (value?: string) => value ? <Image src={value} width={48} height={48} style={{ objectFit: 'cover', borderRadius: 6 }} /> : <span className="muted-text">未设</span>,
          },
          { title: '名称', dataIndex: 'name' },
          { title: '分类', render: (_, record) => record.category?.name ?? '未分类', width: 120 },
          { title: '编码', dataIndex: 'code' },
          {
            title: '前台',
            width: 120,
            render: (_, record) => (
              <Space size={4}>
                {record.isHot ? <Tag color="gold">热门</Tag> : null}
                <Tag>排序 {record.sort ?? 0}</Tag>
              </Space>
            ),
          },
          {
            title: '状态',
            dataIndex: 'status',
            width: 120,
            render: (value: string) => <Tag color={value === 'active' ? 'green' : 'default'}>{value === 'active' ? '启用' : '停用'}</Tag>,
          },
          { title: '模板数', render: (_, record) => record.templates?.length ?? 0, width: 120 },
          canWrite ? {
            title: '操作',
            width: 160,
            render: (_, record) => (
              <Space>
                <Button type="link" onClick={() => openEdit(record)}>编辑</Button>
                <Popconfirm title="确定停用该产品？" onConfirm={() => disable(record)} disabled={record.status !== 'active'}>
                  <Button type="link" danger disabled={record.status !== 'active'}>停用</Button>
                </Popconfirm>
              </Space>
            ),
          } : {},
        ]}
      />
      <Modal title={editing ? '编辑产品' : '新增产品'} open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="产品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="code" label="产品编码" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="description" label="产品说明">
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="applicationScenario" label="应用场景">
            <Input.TextArea rows={2} />
          </Form.Item>
          <Form.Item name="coverImage" label="封面图地址">
            <Input placeholder="https://...，用于首页、产品列表和详情头图" />
          </Form.Item>
          <Form.Item name="gallery" label="详情图集地址">
            <Input.TextArea rows={4} placeholder="每行一个图片地址，产品详情页会按顺序展示" />
          </Form.Item>
          <Form.Item name="categoryId" label="所属分类">
            <Select
              allowClear
              placeholder="选择分类"
              options={categories.map((item) => ({ value: Number(item.id), label: item.name }))}
            />
          </Form.Item>
          <Form.Item name="sort" label="排序">
            <InputNumber min={0} max={9999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isHot" label="首页热门" valuePropName="checked">
            <Switch />
          </Form.Item>
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

function TemplateList() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<ProductTemplate>('/admin/product-templates');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ProductTemplate | null>(null);
  const [keyword, setKeyword] = useState('');
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:product');

  const filteredData = useMemo(() => {
    return data.filter((item) => [item.templateName, item.productId].some((value) => String(value).includes(keyword.trim())));
  }, [data, keyword]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ productId: 1, minPrice: 300, defaultLossRate: 1.08 });
    setOpen(true);
  }

  function openEdit(record: ProductTemplate) {
    setEditing(record);
    form.setFieldsValue({
      ...record,
      materialIds: optionValues(record, 'material'),
      processCodes: optionValues(record, 'process'),
      printModes: optionValues(record, 'print_mode'),
      shapeTypes: optionValues(record, 'shape'),
    });
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    const payload = {
      ...values,
      materialIds: parseNumberList(values.materialIds),
      processCodes: parseStringList(values.processCodes),
      printModes: parseStringList(values.printModes),
      shapeTypes: parseStringList(values.shapeTypes),
    };
    if (editing) {
      await put(`/admin/product-templates/${editing.id}`, payload);
      message.success('报价模板已更新');
    } else {
      await post('/admin/product-templates', payload);
      message.success('报价模板已创建');
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader
        title="报价模板"
        description="控制报价尺寸、数量、材料和工艺范围"
        onRefresh={reload}
        extra={canWrite ? <Button type="primary" onClick={openCreate}>新增模板</Button> : null}
      />
      <div className="filter-bar">
        <Input.Search
          allowClear
          placeholder="搜索模板名称或产品编号"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 280 }}
        />
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={filteredData}
        columns={[
          { title: '编号', dataIndex: 'id', width: 90 },
          { title: '模板名称', dataIndex: 'templateName' },
          { title: '产品编号', dataIndex: 'productId', width: 100 },
          { title: '尺寸范围', render: (_, r) => `${r.widthMin}-${r.widthMax} × ${r.heightMin}-${r.heightMax}` },
          { title: '数量范围', render: (_, r) => `${r.quantityMin}-${r.quantityMax}` },
          { title: '最低收费', dataIndex: 'minPrice', width: 120 },
          canWrite ? {
            title: '操作',
            width: 100,
            render: (_, record) => <Button type="link" onClick={() => openEdit(record)}>编辑</Button>,
          } : {},
        ]}
      />
      <Modal title={editing ? '编辑报价模板' : '新增报价模板'} open={open} onOk={submit} onCancel={() => setOpen(false)} width={760}>
        <Form form={form} layout="vertical">
          <Space.Compact block>
            <Form.Item name="productId" label="产品编号" rules={[{ required: true }]} style={{ width: '30%' }}>
              <InputNumber style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="templateName" label="模板名称" rules={[{ required: true }]} style={{ width: '70%' }}>
              <Input />
            </Form.Item>
          </Space.Compact>
          <Space.Compact block>
            <Form.Item name="widthMin" label="最小宽" rules={[{ required: true }]}><InputNumber /></Form.Item>
            <Form.Item name="widthMax" label="最大宽" rules={[{ required: true }]}><InputNumber /></Form.Item>
            <Form.Item name="heightMin" label="最小高" rules={[{ required: true }]}><InputNumber /></Form.Item>
            <Form.Item name="heightMax" label="最大高" rules={[{ required: true }]}><InputNumber /></Form.Item>
          </Space.Compact>
          <Space.Compact block>
            <Form.Item name="quantityMin" label="最小数量" rules={[{ required: true }]}><InputNumber /></Form.Item>
            <Form.Item name="quantityMax" label="最大数量" rules={[{ required: true }]}><InputNumber /></Form.Item>
            <Form.Item name="minPrice" label="最低收费"><InputNumber /></Form.Item>
            <Form.Item name="defaultLossRate" label="损耗率"><InputNumber step={0.01} /></Form.Item>
          </Space.Compact>
          <Form.Item name="materialIds" label="材料编号，逗号分隔"><Input placeholder="1,2,3" /></Form.Item>
          <Form.Item name="processCodes" label="工艺编码，逗号分隔"><Input placeholder="lamination,die_cut" /></Form.Item>
          <Form.Item name="printModes" label="印刷方式，逗号分隔"><Input placeholder="four_color,single_color" /></Form.Item>
          <Form.Item name="shapeTypes" label="形状，逗号分隔"><Input placeholder="rectangle,custom" /></Form.Item>
          <Space size="large">
            <Form.Item name="allowCustomShape" label="允许异形" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="allowProofing" label="允许打样" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="allowLamination" label="允许覆膜" valuePropName="checked"><Switch /></Form.Item>
            <Form.Item name="allowDieCut" label="允许模切" valuePropName="checked"><Switch /></Form.Item>
          </Space>
        </Form>
      </Modal>
    </>
  );
}

function parseStringList(value?: string): string[] {
  return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
}

function parseLineList(value?: string): string[] {
  return value ? value.split(/\r?\n|,/).map((item) => item.trim()).filter(Boolean) : [];
}

function parseNumberList(value?: string): number[] {
  return parseStringList(value).map(Number).filter((value) => Number.isFinite(value));
}

function optionValues(record: ProductTemplate, type: 'material' | 'process' | 'print_mode' | 'shape'): string {
  return record.options
    ?.filter((item) => item.optionType === type)
    .map((item) => item.optionValue)
    .join(',') ?? '';
}
