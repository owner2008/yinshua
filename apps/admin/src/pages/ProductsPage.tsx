import { App, Button, Form, Input, InputNumber, Modal, Space, Table, Tabs } from 'antd';
import { useState } from 'react';
import { post } from '../api';
import { Product, ProductTemplate } from '../types';
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
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    await post('/admin/products', form.getFieldsValue());
    message.success('产品已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader
        title="产品管理"
        description="维护前台展示的产品档案"
        onRefresh={reload}
        extra={<Button type="primary" onClick={() => setOpen(true)}>新增产品</Button>}
      />
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 90 },
          { title: '名称', dataIndex: 'name' },
          { title: '编码', dataIndex: 'code' },
          { title: '状态', dataIndex: 'status', width: 120 },
          { title: '模板数', render: (_, record) => record.templates?.length ?? 0, width: 120 },
        ]}
      />
      <Modal title="新增产品" open={open} onOk={submit} onCancel={() => setOpen(false)}>
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
        </Form>
      </Modal>
    </>
  );
}

function TemplateList() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<ProductTemplate>('/admin/product-templates');
  const [open, setOpen] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    const values = form.getFieldsValue();
    await post('/admin/product-templates', {
      ...values,
      materialIds: parseNumberList(values.materialIds),
      processCodes: parseStringList(values.processCodes),
      printModes: parseStringList(values.printModes),
      shapeTypes: parseStringList(values.shapeTypes),
    });
    message.success('报价模板已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader
        title="报价模板"
        description="控制报价尺寸、数量、材料和工艺范围"
        onRefresh={reload}
        extra={<Button type="primary" onClick={() => setOpen(true)}>新增模板</Button>}
      />
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 90 },
          { title: '模板名称', dataIndex: 'templateName' },
          { title: '产品ID', dataIndex: 'productId', width: 100 },
          { title: '尺寸范围', render: (_, r) => `${r.widthMin}-${r.widthMax} x ${r.heightMin}-${r.heightMax}` },
          { title: '数量范围', render: (_, r) => `${r.quantityMin}-${r.quantityMax}` },
          { title: '最低收费', dataIndex: 'minPrice', width: 120 },
        ]}
      />
      <Modal title="新增报价模板" open={open} onOk={submit} onCancel={() => setOpen(false)} width={720}>
        <Form form={form} layout="vertical" initialValues={{ productId: 1, minPrice: 300, defaultLossRate: 1.08 }}>
          <Space.Compact block>
            <Form.Item name="productId" label="产品ID" rules={[{ required: true }]} style={{ width: '30%' }}>
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
          <Form.Item name="materialIds" label="材料ID，逗号分隔"><Input placeholder="1,2,3" /></Form.Item>
          <Form.Item name="processCodes" label="工艺编码，逗号分隔"><Input placeholder="lamination,die_cut" /></Form.Item>
          <Form.Item name="printModes" label="印刷方式，逗号分隔"><Input placeholder="four_color,single_color" /></Form.Item>
          <Form.Item name="shapeTypes" label="形状，逗号分隔"><Input placeholder="rectangle,custom" /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function parseStringList(value?: string): string[] {
  return value ? value.split(',').map((item) => item.trim()).filter(Boolean) : [];
}

function parseNumberList(value?: string): number[] {
  return parseStringList(value).map(Number).filter((value) => Number.isFinite(value));
}
