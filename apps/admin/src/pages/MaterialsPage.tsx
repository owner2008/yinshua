import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tabs, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { hasAdminPermission, post, put } from '../api';
import { Material, MaterialPrice } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

const priceTypeOptions = [
  { label: '报价计算', value: 'calc' },
  { label: '采购参考', value: 'purchase' },
  { label: '手工维护', value: 'manual' },
];

const currencyOptions = [
  { label: '人民币', value: 'CNY' },
];

const materialTypeOptions = [
  { label: '面材', value: 'face' },
  { label: '覆膜材料', value: 'lamination' },
  { label: '胶黏材料', value: 'adhesive' },
  { label: '底纸', value: 'liner' },
  { label: '其他材料', value: 'other' },
];

const materialUnitOptions = [
  { label: '平方米', value: 'm2' },
  { label: '米', value: 'm' },
  { label: '张', value: 'sheet' },
  { label: '卷', value: 'roll' },
  { label: '个', value: 'piece' },
];

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
  const [editing, setEditing] = useState<Material | null>(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>();
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:pricing');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedKeyword = [item.code, item.name, item.type, item.unit, item.spec, item.brand].some((value) =>
        value?.toLowerCase().includes(keyword.trim().toLowerCase()),
      );
      const matchedStatus = status ? item.status === status : true;
      return matchedKeyword && matchedStatus;
    });
  }, [data, keyword, status]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ type: 'face', unit: 'm2', status: 'active' });
    setOpen(true);
  }

  function openEdit(record: Material) {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    if (editing) {
      await put(`/admin/materials/${editing.id}`, values);
      message.success('材料已更新');
    } else {
      await post('/admin/materials', values);
      message.success('材料已创建');
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
    await reload();
  }

  async function disable(record: Material) {
    await put(`/admin/materials/${record.id}`, { status: 'inactive' });
    message.success('材料已停用');
    await reload();
  }

  return (
    <>
      <PageHeader title="材料管理" onRefresh={reload} extra={canWrite ? <Button type="primary" onClick={openCreate}>新增材料</Button> : null} />
      <div className="filter-bar">
        <Input.Search
          allowClear
          placeholder="搜索材料名称、编码、类型或规格"
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
        { title: '编码', dataIndex: 'code' },
        { title: '名称', dataIndex: 'name' },
        { title: '类型', dataIndex: 'type', render: renderMaterialType },
        { title: '单位', dataIndex: 'unit', render: renderMaterialUnit },
        { title: '规格', dataIndex: 'spec' },
        { title: '品牌', dataIndex: 'brand' },
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
              <Popconfirm title="确定停用该材料？" onConfirm={() => disable(record)} disabled={record.status !== 'active'}>
                <Button type="link" danger disabled={record.status !== 'active'}>停用</Button>
              </Popconfirm>
            </Space>
          ),
        } : {},
      ]} />
      <Modal title={editing ? '编辑材料' : '新增材料'} open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={materialTypeOptions} />
          </Form.Item>
          <Form.Item name="unit" label="单位" rules={[{ required: true }]}>
            <Select options={materialUnitOptions} />
          </Form.Item>
          <Form.Item name="spec" label="规格"><Input /></Form.Item>
          <Form.Item name="brand" label="品牌"><Input /></Form.Item>
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

function MaterialPrices() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<MaterialPrice>('/admin/material-prices');
  const { data: materials } = useRemoteList<Material>('/admin/materials');
  const [open, setOpen] = useState(false);
  const [currentOnly, setCurrentOnly] = useState<string>('all');
  const [materialId, setMaterialId] = useState<string>();
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:pricing');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedCurrent = currentOnly === 'current' ? item.isCurrent : true;
      const matchedMaterial = materialId ? String(item.materialId) === materialId : true;
      return matchedCurrent && matchedMaterial;
    });
  }, [currentOnly, data, materialId]);

  async function submit() {
    const values = await form.validateFields();
    await post('/admin/material-prices', values);
    message.success('材料价格已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="材料价格" description="新增价格后，旧的当前价格会自动失效" onRefresh={reload} extra={canWrite ? <Button type="primary" onClick={() => setOpen(true)}>新增价格</Button> : null} />
      <div className="filter-bar">
        <Select
          allowClear
          placeholder="材料"
          value={materialId}
          onChange={setMaterialId}
          style={{ width: 220 }}
          options={materials.map((item) => ({ label: `${item.name} (${item.code})`, value: String(item.id) }))}
        />
        <Select
          value={currentOnly}
          onChange={setCurrentOnly}
          style={{ width: 140 }}
          options={[
            { label: '全部价格', value: 'all' },
            { label: '当前价格', value: 'current' },
          ]}
        />
      </div>
      <Table rowKey="id" loading={loading} dataSource={filteredData} columns={[
        { title: '编号', dataIndex: 'id' },
        { title: '材料', render: (_, record) => record.material ? `${record.material.name} (${record.material.code})` : record.materialId },
        { title: '价格类型', dataIndex: 'priceType', render: renderPriceType },
        { title: '单价', dataIndex: 'unitPrice' },
        { title: '币种', dataIndex: 'currency', render: renderCurrency },
        { title: '当前', dataIndex: 'isCurrent', render: (value: boolean) => <Tag color={value ? 'green' : 'default'}>{value ? '当前' : '历史'}</Tag> },
      ]} />
      <Modal title="新增材料价格" open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ priceType: 'calc', currency: 'CNY' }}>
          <Form.Item name="materialId" label="材料" rules={[{ required: true }]}>
            <Select options={materials.map((item) => ({ label: `${item.name} (${item.code})`, value: Number(item.id) }))} />
          </Form.Item>
          <Form.Item name="unitPrice" label="单价" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
          <Form.Item name="priceType" label="价格类型"><Select options={priceTypeOptions} /></Form.Item>
          <Form.Item name="currency" label="币种"><Select options={currencyOptions} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function renderPriceType(value?: string): string {
  return priceTypeOptions.find((option) => option.value === value)?.label ?? value ?? '-';
}

function renderCurrency(value?: string): string {
  return currencyOptions.find((option) => option.value === value)?.label ?? value ?? '-';
}

function renderMaterialType(value?: string): string {
  return materialTypeOptions.find((option) => option.value === value)?.label ?? value ?? '-';
}

function renderMaterialUnit(value?: string): string {
  return materialUnitOptions.find((option) => option.value === value)?.label ?? value ?? '-';
}
