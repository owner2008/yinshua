import { Table, Tag } from 'antd';
import { Quote } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

export function QuotesPage() {
  const { data, loading, reload } = useRemoteList<Quote>('/admin/quotes');

  return (
    <div className="page-card">
      <PageHeader title="报价单" description="查看已保存报价和报价快照" onRefresh={reload} />
      <Table
        rowKey="quoteNo"
        loading={loading}
        dataSource={data}
        columns={[
          { title: '报价单号', dataIndex: 'quoteNo' },
          { title: '产品ID', dataIndex: 'productId', width: 100 },
          { title: '模板ID', dataIndex: 'productTemplateId', width: 100 },
          { title: '数量', dataIndex: 'quantity', width: 120 },
          { title: '基础成本', render: (_, r) => r.summary?.baseCost, width: 120 },
          { title: '最终报价', render: (_, r) => <Tag color="green">{r.summary?.finalPrice}</Tag>, width: 120 },
          { title: '单价', render: (_, r) => r.summary?.unitPrice, width: 120 },
        ]}
      />
    </div>
  );
}
