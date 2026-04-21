import { Table } from 'antd';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

export function OperationLogsPage() {
  const { data, loading, reload } = useRemoteList<Record<string, unknown>>('/admin/operation-logs');

  return (
    <div className="page-card">
      <PageHeader title="操作日志" description="后台关键配置变更 before / after 记录" onRefresh={reload} />
      <Table
        rowKey="id"
        loading={loading}
        dataSource={data}
        columns={[
          { title: 'ID', dataIndex: 'id', width: 90 },
          { title: '模块', dataIndex: 'module', width: 160 },
          { title: '动作', dataIndex: 'action', width: 120 },
          { title: '对象', dataIndex: 'targetType', width: 160 },
          { title: '对象ID', dataIndex: 'targetId', width: 120 },
          { title: '时间', dataIndex: 'createdAt', width: 200 },
          { title: '修改前', dataIndex: 'beforeJson', render: (value) => <pre>{JSON.stringify(value, null, 2)}</pre> },
          { title: '修改后', dataIndex: 'afterJson', render: (value) => <pre>{JSON.stringify(value, null, 2)}</pre> },
        ]}
        scroll={{ x: 1200 }}
      />
    </div>
  );
}
