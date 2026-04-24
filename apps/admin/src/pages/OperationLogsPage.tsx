import { Button, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { OperationLog } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

const moduleLabels: Record<string, string> = {
  'admin-access': '权限管理',
  product: '产品管理',
  category: '产品分类',
  material: '材料管理',
  pricing: '价格管理',
  process: '工艺管理',
  inventory: '库存管理',
  quote: '报价管理',
  member: '会员管理',
};

const actionLabels: Record<string, string> = {
  create: '新增',
  update: '更新',
  delete: '删除',
  disable: '停用',
  enable: '启用',
  login: '登录',
};

const targetTypeLabels: Record<string, string> = {
  product: '产品',
  category: '产品分类',
  material: '材料',
  process: '工艺',
  warehouse: '仓库',
  quote: '报价单',
  member: '会员',
  role: '角色',
  user: '管理员',
};

export function OperationLogsPage() {
  const { data, loading, reload } = useRemoteList<OperationLog>('/admin/operation-logs');
  const [keyword, setKeyword] = useState('');
  const [moduleName, setModuleName] = useState<string>();
  const [action, setAction] = useState<string>();
  const [detail, setDetail] = useState<OperationLog | null>(null);

  const moduleOptions = useMemo(() => Array.from(new Set(data.map((item) => item.module))).map((value) => ({ label: renderModule(value), value })), [data]);
  const actionOptions = useMemo(() => Array.from(new Set(data.map((item) => item.action))).map((value) => ({ label: renderAction(value), value })), [data]);
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchedKeyword = [item.targetType, item.targetId, item.module, item.action].some((value) =>
        String(value).toLowerCase().includes(keyword.trim().toLowerCase()),
      );
      const matchedModule = moduleName ? item.module === moduleName : true;
      const matchedAction = action ? item.action === action : true;
      return matchedKeyword && matchedModule && matchedAction;
    });
  }, [action, data, keyword, moduleName]);

  return (
    <div className="page-card">
      <PageHeader title="操作日志" description="后台关键配置变更 before / after 记录" onRefresh={reload} />
      <div className="filter-bar">
        <Input.Search
          allowClear
          placeholder="搜索模块、动作、对象或对象编号"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 300 }}
        />
        <Select allowClear placeholder="模块" value={moduleName} onChange={setModuleName} style={{ width: 180 }} options={moduleOptions} />
        <Select allowClear placeholder="动作" value={action} onChange={setAction} style={{ width: 160 }} options={actionOptions} />
      </div>
      <Table
        rowKey="id"
        loading={loading}
        dataSource={filteredData}
        columns={[
          { title: '编号', dataIndex: 'id', width: 90 },
          { title: '模块', dataIndex: 'module', width: 160, render: renderModule },
          { title: '动作', dataIndex: 'action', width: 120, render: (value: string) => <Tag>{renderAction(value)}</Tag> },
          { title: '对象', dataIndex: 'targetType', width: 160, render: renderTargetType },
          { title: '对象编号', dataIndex: 'targetId', width: 120 },
          { title: '时间', dataIndex: 'createdAt', width: 200 },
          {
            title: '操作',
            width: 100,
            render: (_, record) => <Button type="link" onClick={() => setDetail(record)}>详情</Button>,
          },
        ]}
        scroll={{ x: 900 }}
      />
      <Modal title="操作日志详情" open={Boolean(detail)} onCancel={() => setDetail(null)} footer={null} width={860}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Table
            rowKey="label"
            pagination={false}
            dataSource={[
              { label: '模块', value: renderModule(detail?.module) },
              { label: '动作', value: renderAction(detail?.action) },
              { label: '对象', value: renderTargetType(detail?.targetType) },
              { label: '对象编号', value: detail?.targetId },
              { label: '时间', value: detail?.createdAt },
            ]}
            columns={[
              { title: '字段', dataIndex: 'label', width: 160 },
              { title: '值', dataIndex: 'value' },
            ]}
          />
          <div>
            <div className="json-title">修改前</div>
            <pre className="json-block">{JSON.stringify(detail?.beforeJson ?? {}, null, 2)}</pre>
          </div>
          <div>
            <div className="json-title">修改后</div>
            <pre className="json-block">{JSON.stringify(detail?.afterJson ?? {}, null, 2)}</pre>
          </div>
        </Space>
      </Modal>
    </div>
  );
}

function renderModule(value?: string): string {
  return value ? moduleLabels[value] ?? value : '-';
}

function renderAction(value?: string): string {
  return value ? actionLabels[value] ?? value : '-';
}

function renderTargetType(value?: string): string {
  return value ? targetTypeLabels[value] ?? value : '-';
}
