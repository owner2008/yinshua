import { Button, Input, Modal, Select, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { OperationLog } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

export function OperationLogsPage() {
  const { data, loading, reload } = useRemoteList<OperationLog>('/admin/operation-logs');
  const [keyword, setKeyword] = useState('');
  const [moduleName, setModuleName] = useState<string>();
  const [action, setAction] = useState<string>();
  const [detail, setDetail] = useState<OperationLog | null>(null);

  const moduleOptions = useMemo(() => Array.from(new Set(data.map((item) => item.module))).map((value) => ({ label: value, value })), [data]);
  const actionOptions = useMemo(() => Array.from(new Set(data.map((item) => item.action))).map((value) => ({ label: value, value })), [data]);
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
          placeholder="搜索模块、动作、对象或对象ID"
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
          { title: 'ID', dataIndex: 'id', width: 90 },
          { title: '模块', dataIndex: 'module', width: 160 },
          { title: '动作', dataIndex: 'action', width: 120, render: (value: string) => <Tag>{value}</Tag> },
          { title: '对象', dataIndex: 'targetType', width: 160 },
          { title: '对象ID', dataIndex: 'targetId', width: 120 },
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
              { label: '模块', value: detail?.module },
              { label: '动作', value: detail?.action },
              { label: '对象', value: detail?.targetType },
              { label: '对象ID', value: detail?.targetId },
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
