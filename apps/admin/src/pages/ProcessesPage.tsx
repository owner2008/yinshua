import { App, Button, Form, Input, InputNumber, Modal, Popconfirm, Select, Space, Table, Tabs, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { hasAdminPermission, post, put } from '../api';
import { PrintPrice, Process, ProcessPrice } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

const processTypeOptions = [
  { label: '表面工艺', value: 'surface' },
  { label: '模切加工', value: 'cutting' },
  { label: '打样服务', value: 'proof' },
];

const feeModeOptions = [
  { label: '按面积计费', value: 'per_area' },
  { label: '按数量计费', value: 'per_qty' },
  { label: '固定费用', value: 'fixed' },
  { label: '固定费加数量费', value: 'fixed_plus_qty' },
];

const printModeLabelOptions = [
  { label: '四色印刷', value: 'four_color' },
  { label: '单色印刷', value: 'single_color' },
];

export function ProcessesPage() {
  return (
    <div className="page-card">
      <Tabs
        items={[
          { key: 'processes', label: '工艺', children: <ProcessList /> },
          { key: 'processPrices', label: '工艺价格', children: <ProcessPrices /> },
          { key: 'printPrices', label: '印刷价格', children: <PrintPrices /> },
        ]}
      />
    </div>
  );
}

function ProcessList() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<Process>('/admin/processes');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Process | null>(null);
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>('active');
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:pricing');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedKeyword = [item.code, item.name, item.processType, item.feeMode].some((value) =>
        value?.toLowerCase().includes(keyword.trim().toLowerCase()),
      );
      const matchedStatus = status ? item.status === status : true;
      return matchedKeyword && matchedStatus;
    });
  }, [data, keyword, status]);

  function openCreate() {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ processType: 'surface', feeMode: 'per_area', status: 'active' });
    setOpen(true);
  }

  function openEdit(record: Process) {
    setEditing(record);
    form.setFieldsValue(record);
    setOpen(true);
  }

  async function submit() {
    const values = await form.validateFields();
    if (editing) {
      await put(`/admin/processes/${editing.id}`, values);
      message.success('工艺已更新');
    } else {
      await post('/admin/processes', values);
      message.success('工艺已创建');
    }
    setOpen(false);
    setEditing(null);
    form.resetFields();
    await reload();
  }

  async function disable(record: Process) {
    await put(`/admin/processes/${record.id}`, { status: 'inactive' });
    message.success('工艺已删除');
    await reload();
  }

  async function restore(record: Process) {
    await put(`/admin/processes/${record.id}`, { status: 'active' });
    message.success('工艺已恢复');
    await reload();
  }

  return (
    <>
      <PageHeader title="工艺管理" onRefresh={reload} extra={canWrite ? <Button type="primary" onClick={openCreate}>新增工艺</Button> : null} />
      <div className="filter-bar">
        <Input.Search
          allowClear
          placeholder="搜索工艺名称、编码、类型或计费方式"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 320 }}
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
        { title: '类型', dataIndex: 'processType', render: renderProcessType },
        { title: '计费方式', dataIndex: 'feeMode', render: renderFeeMode },
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
                <Popconfirm title="确定删除该工艺？" description="删除后默认列表不再显示，可通过状态筛选找回。" onConfirm={() => disable(record)}>
                  <Button type="link" danger>删除</Button>
                </Popconfirm>
              ) : (
                <Popconfirm title="确定恢复该工艺？" onConfirm={() => restore(record)}>
                  <Button type="link">恢复</Button>
                </Popconfirm>
              )}
            </Space>
          ),
        } : {},
      ]} />
      <Modal title={editing ? '编辑工艺' : '新增工艺'} open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="编码" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="name" label="名称" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="processType" label="类型" rules={[{ required: true }]}>
            <Select options={processTypeOptions} />
          </Form.Item>
          <Form.Item name="feeMode" label="计费方式" rules={[{ required: true }]}>
            <Select options={feeModeOptions} />
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

function ProcessPrices() {
  return <ProcessPriceTable />;
}

function PrintPrices() {
  return <PrintPriceTable />;
}

function ProcessPriceTable() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<ProcessPrice>('/admin/process-prices');
  const { data: processes } = useRemoteList<Process>('/admin/processes');
  const [open, setOpen] = useState(false);
  const [currentOnly, setCurrentOnly] = useState('all');
  const [processId, setProcessId] = useState<string>();
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:pricing');

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedCurrent = currentOnly === 'current' ? item.isCurrent : true;
      const matchedProcess = processId ? String(item.processId) === processId : true;
      return matchedCurrent && matchedProcess;
    });
  }, [currentOnly, data, processId]);

  async function submit() {
    const values = await form.validateFields();
    await post('/admin/process-prices', values);
    message.success('工艺价格已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="工艺价格" onRefresh={reload} extra={canWrite ? <Button type="primary" onClick={() => setOpen(true)}>新增价格</Button> : null} />
      <div className="filter-bar">
        <Select
          allowClear
          placeholder="工艺"
          value={processId}
          onChange={setProcessId}
          style={{ width: 220 }}
          options={processes.map((item) => ({ label: `${item.name} (${item.code})`, value: String(item.id) }))}
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
        { title: '工艺', render: (_, record) => record.process ? `${record.process.name} (${record.process.code})` : record.processId },
        { title: '计费方式', dataIndex: 'feeMode', render: renderFeeMode },
        { title: '单价', dataIndex: 'unitPrice' },
        { title: '固定费', dataIndex: 'setupFee' },
        { title: '最低收费', dataIndex: 'minFee' },
        { title: '当前', dataIndex: 'isCurrent', render: (value: boolean) => <Tag color={value ? 'green' : 'default'}>{value ? '当前' : '历史'}</Tag> },
      ]} />
      <Modal title="新增工艺价格" open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ feeMode: 'per_area', setupFee: 0, minFee: 0 }}>
          <Form.Item name="processId" label="工艺" rules={[{ required: true }]}>
            <Select options={processes.map((item) => ({ label: `${item.name} (${item.code})`, value: Number(item.id) }))} />
          </Form.Item>
          <Form.Item name="feeMode" label="计费方式" rules={[{ required: true }]}>
            <Select options={feeModeOptions} />
          </Form.Item>
          <Form.Item name="unitPrice" label="单价" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
          <Form.Item name="setupFee" label="固定费"><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
          <Form.Item name="minFee" label="最低收费"><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function PrintPriceTable() {
  const { message } = App.useApp();
  const { data, loading, reload } = useRemoteList<PrintPrice>('/admin/print-prices');
  const [open, setOpen] = useState(false);
  const [currentOnly, setCurrentOnly] = useState('all');
  const [printMode, setPrintMode] = useState<string>();
  const [form] = Form.useForm();
  const canWrite = hasAdminPermission('admin:pricing');

  const visiblePrintModeOptions = useMemo(
    () =>
      Array.from(new Set(data.map((item) => item.printMode))).map((value) => ({
        label: renderPrintMode(value),
        value,
      })),
    [data],
  );
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedCurrent = currentOnly === 'current' ? item.isCurrent : true;
      const matchedMode = printMode ? item.printMode === printMode : true;
      return matchedCurrent && matchedMode;
    });
  }, [currentOnly, data, printMode]);

  async function submit() {
    const values = await form.validateFields();
    await post('/admin/print-prices', values);
    message.success('印刷价格已创建');
    setOpen(false);
    form.resetFields();
    await reload();
  }

  return (
    <>
      <PageHeader title="印刷价格" onRefresh={reload} extra={canWrite ? <Button type="primary" onClick={() => setOpen(true)}>新增价格</Button> : null} />
      <div className="filter-bar">
        <Select allowClear placeholder="印刷方式" value={printMode} onChange={setPrintMode} style={{ width: 180 }} options={visiblePrintModeOptions} />
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
        { title: '印刷方式', dataIndex: 'printMode', render: renderPrintMode },
        { title: '计费方式', dataIndex: 'feeMode', render: renderFeeMode },
        { title: '单价', dataIndex: 'unitPrice' },
        { title: '开机费', dataIndex: 'setupFee' },
        { title: '当前', dataIndex: 'isCurrent', render: (value: boolean) => <Tag color={value ? 'green' : 'default'}>{value ? '当前' : '历史'}</Tag> },
      ]} />
      <Modal title="新增印刷价格" open={open} onOk={submit} onCancel={() => setOpen(false)}>
        <Form form={form} layout="vertical" initialValues={{ feeMode: 'per_area', setupFee: 0 }}>
          <Form.Item name="printMode" label="印刷方式" rules={[{ required: true }]}>
            <Select options={printModeLabelOptions} />
          </Form.Item>
          <Form.Item name="feeMode" label="计费方式" rules={[{ required: true }]}>
            <Select options={feeModeOptions} />
          </Form.Item>
          <Form.Item name="unitPrice" label="单价" rules={[{ required: true }]}><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
          <Form.Item name="setupFee" label="开机费"><InputNumber style={{ width: '100%' }} step={0.01} /></Form.Item>
        </Form>
      </Modal>
    </>
  );
}

function renderProcessType(value?: string): string {
  return processTypeOptions.find((option) => option.value === value)?.label ?? value ?? '-';
}

function renderFeeMode(value?: string): string {
  return feeModeOptions.find((option) => option.value === value)?.label ?? value ?? '-';
}

function renderPrintMode(value?: string): string {
  return printModeLabelOptions.find((option) => option.value === value)?.label ?? value ?? '-';
}
