import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tabs, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { hasAdminPermission, post, put } from '../api';
import { Material, StockItem, StockMovement, Warehouse } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

const warehouseTypeOptions = [
  { label: '原材料仓', value: 'raw' },
  { label: '成品仓', value: 'finished' },
  { label: '半成品仓', value: 'semi_finished' },
  { label: '辅料仓', value: 'auxiliary' },
  { label: '其他仓库', value: 'other' },
];

export function InventoryPage() {
  return (
    <div className="page-card">
      <Tabs
        items={[
          { key: 'warehouses', label: '仓库', children: <Warehouses /> },
          { key: 'items', label: '库存', children: <StockItems /> },
          { key: 'movements', label: '流水', children: <Movements /> },
        ]}
      />
    </div>
  );
}

function Warehouses() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Warehouse>('/admin/warehouses');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Warehouse | null>(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>();
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:inventory');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedKeyword = [item.name, item.code, item.type].some((value) =>
        value?.toLowerCase().includes(keyword.trim().toLowerCase()),
      );
      const matchedStatus = status ? item.status === status : true;
      return matchedKeyword && matchedStatus;
    });
  }, [data, keyword, status]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ type: 'raw', status: 'active' });
    setOpen(true);
  }

  function openEdit(record: Warehouse) {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    if (editing) {
      await put(`/admin/warehouses/${editing.id}`, values);
      message.success('仓库已更新');
    } else {
      await post('/admin/warehouses', values);
      message.success('仓库已创建');
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
    await reload();
  }

  async function disable(record: Warehouse) {
    await put(`/admin/warehouses/${record.id}`, { status: 'inactive' });
    message.success('仓库已停用');
    await reload();
  }

  return (
    <>
      <PageHeader title="仓库管理" onRefresh={reload} extra={canWrite ? <Button type="primary" onClick={openCreate}>新增仓库</Button> : null} />
      <div className="filter-bar">
        <Input.Search
          allowClear
          placeholder="搜索仓库名称、编码或类型"
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
      <Table rowKey="id" loading={loading} dataSource={filteredData} columns={[
        { title: '编号', dataIndex: 'id' },
        { title: '名称', dataIndex: 'name' },
        { title: '编码', dataIndex: 'code' },
        { title: '类型', dataIndex: 'type', render: renderWarehouseType },
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
              <Popconfirm title="确定停用该仓库？" onConfirm={() => disable(record)} disabled={record.status !== 'active'}>
                <Button type="link" danger disabled={record.status !== 'active'}>停用</Button>
              </Popconfirm>
            </Space>
          ),
        } : {},
      ]} />
      <Modal title={editing ? '编辑仓库' : '新增仓库'} open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="type" label="类型" rules={[{ required: true }]}>
            <Select options={warehouseTypeOptions} />
          </Form.Item>
          <Form.Item name="managerId" label="管理员编号"><InputNumber style={{ width: '100%' }} /></Form.Item>
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

function StockItems() {
  const { data, loading, reload } = useRemoteList<StockItem>('/admin/stock-items');
  const [keyword, setKeyword] = useState('');
  const [warehouseId, setWarehouseId] = useState<string>();
  const [lowOnly, setLowOnly] = useState('all');

  const warehouseOptions = useMemo(
    () => Array.from(new Map(data.map((item) => [String(item.warehouseId), item.warehouse])).entries())
      .map(([value, warehouse]) => ({ label: warehouse ? `${warehouse.name} (${warehouse.code})` : value, value })),
    [data],
  );
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedKeyword = [item.material?.name, item.material?.code, item.warehouse?.name, item.warehouse?.code].some((value) =>
        value?.toLowerCase().includes(keyword.trim().toLowerCase()),
      );
      const matchedWarehouse = warehouseId ? String(item.warehouseId) === warehouseId : true;
      const matchedLow = lowOnly === 'low' ? Number(item.availableQty) <= Number(item.safetyQty) : true;
      return matchedKeyword && matchedWarehouse && matchedLow;
    });
  }, [data, keyword, lowOnly, warehouseId]);

  return (
    <>
      <PageHeader title="库存项" onRefresh={reload} />
      <div className="filter-bar">
        <Input.Search
          allowClear
          placeholder="搜索材料或仓库"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 240 }}
        />
        <Select allowClear placeholder="仓库" value={warehouseId} onChange={setWarehouseId} style={{ width: 220 }} options={warehouseOptions} />
        <Select
          value={lowOnly}
          onChange={setLowOnly}
          style={{ width: 140 }}
          options={[
            { label: '全部库存', value: 'all' },
            { label: '低于安全库存', value: 'low' },
          ]}
        />
      </div>
      <Table rowKey="id" loading={loading} dataSource={filteredData} columns={[
        { title: '编号', dataIndex: 'id' },
        { title: '材料', render: (_, record) => record.material ? `${record.material.name} (${record.material.code})` : record.materialId },
        { title: '仓库', render: (_, record) => record.warehouse ? `${record.warehouse.name} (${record.warehouse.code})` : record.warehouseId },
        { title: '库存数量', dataIndex: 'qty' },
        { title: '可用数量', dataIndex: 'availableQty' },
        { title: '安全库存', dataIndex: 'safetyQty' },
        {
          title: '库存状态',
          render: (_, record) => Number(record.availableQty) <= Number(record.safetyQty)
            ? <Tag color="orange">低库存</Tag>
            : <Tag color="green">正常</Tag>,
        },
      ]} />
    </>
  );
}

function Movements() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<StockMovement>('/admin/stock-movements');
  const { data: warehouses } = useRemoteList<Warehouse>('/admin/warehouses');
  const { data: materials } = useRemoteList<Material>('/admin/materials');
  const [open, setOpen] = useState(false);
  const [movementType, setMovementType] = useState<string>();
  const [warehouseId, setWarehouseId] = useState<string>();
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:inventory');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedType = movementType ? item.movementType === movementType : true;
      const matchedWarehouse = warehouseId ? String(item.warehouseId) === warehouseId : true;
      return matchedType && matchedWarehouse;
    });
  }, [data, movementType, warehouseId]);

  async function submit() {
    const values = await form.validateFields();
    await post('/admin/stock-movements', values);
    message.success('库存流水已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="库存流水" description="支持入库、出库、调整" onRefresh={reload} extra={canWrite ? <Button type="primary" onClick={() => setOpen(true)}>新增流水</Button> : null} />
      <div className="filter-bar">
        <Select
          allowClear
          placeholder="流水类型"
          value={movementType}
          onChange={setMovementType}
          style={{ width: 140 }}
          options={[
            { label: '入库', value: 'in' },
            { label: '出库', value: 'out' },
            { label: '调整', value: 'adjust' },
          ]}
        />
        <Select
          allowClear
          placeholder="仓库"
          value={warehouseId}
          onChange={setWarehouseId}
          style={{ width: 220 }}
          options={warehouses.map((item) => ({ label: `${item.name} (${item.code})`, value: String(item.id) }))}
        />
      </div>
      <Table rowKey="id" loading={loading} dataSource={filteredData} columns={[
        { title: '流水号', dataIndex: 'movementNo' },
        {
          title: '类型',
          dataIndex: 'movementType',
          render: (value: string) => <Tag color={value === 'in' ? 'green' : value === 'out' ? 'red' : 'blue'}>{movementTypeLabel(value)}</Tag>,
        },
        { title: '材料', render: (_, record) => record.material ? `${record.material.name} (${record.material.code})` : record.materialId },
        { title: '仓库', render: (_, record) => record.warehouse ? `${record.warehouse.name} (${record.warehouse.code})` : record.warehouseId },
        { title: '数量', dataIndex: 'qty' },
        { title: '成本', dataIndex: 'unitCost' },
        { title: '时间', dataIndex: 'createdAt' },
      ]} />
      <Modal title="新增库存流水" open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ movementType: 'in' }}>
          <Form.Item name="movementType" label="类型" rules={[{ required: true }]}>
            <Select
              options={[
                { label: '入库', value: 'in' },
                { label: '出库', value: 'out' },
                { label: '调整', value: 'adjust' },
              ]}
            />
          </Form.Item>
          <Form.Item name="warehouseId" label="仓库" rules={[{ required: true }]}>
            <Select options={warehouses.map((item) => ({ label: `${item.name} (${item.code})`, value: Number(item.id) }))} />
          </Form.Item>
          <Form.Item name="materialId" label="材料" rules={[{ required: true }]}>
            <Select options={materials.map((item) => ({ label: `${item.name} (${item.code})`, value: Number(item.id) }))} />
          </Form.Item>
          <Form.Item name="qty" label="数量" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
          <Form.Item name="unitCost" label="单位成本"><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
          <Form.Item name="refType" label="关联类型"><Input /></Form.Item>
          <Form.Item name="refId" label="关联编号"><InputNumber style={{ width: '100%' }} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function movementTypeLabel(value: string): string {
  return { in: '入库', out: '出库', adjust: '调整' }[value] ?? value;
}

function renderWarehouseType(value?: string): string {
  return warehouseTypeOptions.find((option) => option.value === value)?.label ?? value ?? '-';
}
