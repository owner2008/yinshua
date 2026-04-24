import { Button, Input, Modal, Space, Table, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { request } from '../api';
import { Quote } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

export function QuotesPage() {
  const { data, loading, reload } = useRemoteList<Quote>('/admin/quotes');
  const [keyword, setKeyword] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detail, setDetail] = useState<Quote | null>(null);
  const [snapshot, setSnapshot] = useState<Record<string, unknown> | null>(null);

  const filteredData = useMemo(() => {
    return data.filter((item) => [item.quoteNo, item.productId, item.productTemplateId].some((value) =>
      String(value).toLowerCase().includes(keyword.trim().toLowerCase()),
    ));
  }, [data, keyword]);

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

  return (
    <div className="page-card">
      <PageHeader title="报价单" description="查看已保存报价和报价快照" onRefresh={reload} />
      <div className="filter-bar">
        <Input.Search
          allowClear
          placeholder="搜索报价单号、产品编号或模板编号"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          style={{ width: 320 }}
        />
      </div>
      <Table
        rowKey="quoteNo"
        loading={loading}
        dataSource={filteredData}
        columns={[
          { title: '报价单号', dataIndex: 'quoteNo' },
          { title: '产品编号', dataIndex: 'productId', width: 100 },
          { title: '模板编号', dataIndex: 'productTemplateId', width: 100 },
          { title: '数量', dataIndex: 'quantity', width: 120 },
          { title: '基础成本', render: (_, r) => r.summary?.baseCost, width: 120 },
          { title: '最终报价', render: (_, r) => <Tag color="green">{r.summary?.finalPrice}</Tag>, width: 120 },
          { title: '单价', render: (_, r) => r.summary?.unitPrice, width: 120 },
          { title: '时间', dataIndex: 'createdAt', width: 190 },
          { title: '操作', width: 100, render: (_, record) => <Button type="link" onClick={() => openDetail(record)}>详情</Button> },
        ]}
      />
      <Modal title={`报价详情 ${detail?.quoteNo ?? ''}`} open={detailOpen} onCancel={() => setDetailOpen(false)} footer={null} width={860}>
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Table
            rowKey="label"
            loading={detailLoading}
            pagination={false}
            dataSource={[
              { label: '产品编号', value: detail?.productId },
              { label: '模板编号', value: detail?.productTemplateId },
              { label: '数量', value: detail?.quantity },
              { label: '基础成本', value: detail?.summary?.baseCost },
              { label: '最终报价', value: detail?.summary?.finalPrice },
              { label: '单价', value: detail?.summary?.unitPrice },
            ]}
            columns={[
              { title: '字段', dataIndex: 'label', width: 160 },
              { title: '值', dataIndex: 'value' },
            ]}
          />
          <pre className="json-block">{JSON.stringify(snapshot ?? detail?.snapshot ?? {}, null, 2)}</pre>
        </Space>
      </Modal>
    </div>
  );
}
