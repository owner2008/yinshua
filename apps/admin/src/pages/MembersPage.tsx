import { App, Button, Form, Input, InputNumber, Modal, Select, Space, Table, Tabs, Tag } from 'antd';
import { useMemo, useState } from 'react';
import { post, put, request } from '../api';
import { Member, MemberLevel } from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

const statusOptions = [
  { label: '启用', value: 'active' },
  { label: '停用', value: 'disabled' },
];

const customerTypeOptions = [
  { label: '个人客户', value: 'personal' },
  { label: '企业客户', value: 'company' },
];

export function MembersPage() {
  const { message } = App.useApp();
  const members = useRemoteList<Member>('/admin/members');
  const levels = useRemoteList<MemberLevel>('/admin/member-levels');
  const [keyword, setKeyword] = useState('');
  const [status, setStatus] = useState<string>();
  const [memberModal, setMemberModal] = useState<Member | 'new' | null>(null);
  const [detailModal, setDetailModal] = useState<Member | null>(null);
  const [levelModal, setLevelModal] = useState<MemberLevel | 'new' | null>(null);
  const [memberForm] = Form.useForm();
  const [levelForm] = Form.useForm();

  const levelOptions = useMemo(
    () => levels.data.map((level) => ({ label: `${level.name} (${level.discountRate})`, value: Number(level.id) })),
    [levels.data],
  );

  const filteredMembers = useMemo(() => {
    const text = keyword.trim().toLowerCase();
    return members.data.filter((member) => {
      const profile = member.profile;
      const matchKeyword = text
        ? [
            member.id,
            member.mobile,
            member.nickname,
            member.wxOpenid,
            profile?.memberNo,
            profile?.companyName,
            profile?.contactName,
          ].some((value) => String(value ?? '').toLowerCase().includes(text))
        : true;
      const matchStatus = status ? member.status === status : true;
      return matchKeyword && matchStatus;
    });
  }, [keyword, members.data, status]);

  function reloadAll() {
    void members.reload();
    void levels.reload();
  }

  function openMember(record: Member | 'new') {
    setMemberModal(record);
    memberForm.setFieldsValue(
      record === 'new'
        ? { status: 'active', customerType: 'personal' }
        : {
            wxOpenid: record.wxOpenid,
            mobile: record.mobile,
            nickname: record.nickname,
            status: record.status,
            customerType: record.profile?.customerType ?? 'personal',
            companyName: record.profile?.companyName,
            contactName: record.profile?.contactName,
            taxNo: record.profile?.taxNo,
            industry: record.profile?.industry,
            source: record.profile?.source,
            levelId: record.profile?.levelId ? Number(record.profile.levelId) : undefined,
            remark: record.profile?.remark,
          },
    );
  }

  async function openDetail(record: Member) {
    const detail = await request<Member>(`/admin/members/${record.id}`);
    setDetailModal(detail);
  }

  function openLevel(record: MemberLevel | 'new') {
    setLevelModal(record);
    levelForm.setFieldsValue(
      record === 'new'
        ? { discountRate: 1, priority: 0 }
        : {
            name: record.name,
            code: record.code,
            discountRate: Number(record.discountRate),
            priority: record.priority,
            remark: record.remark,
          },
    );
  }

  async function submitMember() {
    const values = await memberForm.validateFields();
    if (memberModal === 'new') {
      await post('/admin/members', values);
      message.success('会员已创建');
    } else if (memberModal) {
      await put(`/admin/members/${memberModal.id}`, values);
      message.success('会员已更新');
    }
    setMemberModal(null);
    memberForm.resetFields();
    await members.reload();
  }

  async function submitLevel() {
    const values = await levelForm.validateFields();
    if (levelModal === 'new') {
      await post('/admin/member-levels', values);
      message.success('会员等级已创建');
    } else if (levelModal) {
      await put(`/admin/member-levels/${levelModal.id}`, values);
      message.success('会员等级已更新');
    }
    setLevelModal(null);
    levelForm.resetFields();
    await levels.reload();
    await members.reload();
  }

  return (
    <div className="page-card">
      <PageHeader
        title="会员管理"
        description="维护会员资料、状态、等级与基础客户信息"
        onRefresh={reloadAll}
      />
      <Tabs
        items={[
          {
            key: 'members',
            label: '会员列表',
            children: (
              <>
                <div className="filter-bar">
                  <Input.Search
                    allowClear
                    placeholder="搜索会员编号、手机号、昵称、联系人"
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    style={{ width: 320 }}
                  />
                  <Select
                    allowClear
                    placeholder="状态"
                    value={status}
                    options={statusOptions}
                    onChange={setStatus}
                    style={{ width: 140 }}
                  />
                  <Button type="primary" onClick={() => openMember('new')}>
                    新增会员
                  </Button>
                </div>
                <Table<Member>
                  rowKey="id"
                  loading={members.loading}
                  dataSource={filteredMembers}
                  scroll={{ x: 1160 }}
                  columns={[
                    { title: '会员编号', render: (_, record) => record.profile?.memberNo ?? '-', width: 140 },
                    { title: '昵称', dataIndex: 'nickname', width: 140 },
                    { title: '手机号', dataIndex: 'mobile', width: 140 },
                    { title: '联系人', render: (_, record) => record.profile?.contactName ?? '-', width: 120 },
                    { title: '企业名称', render: (_, record) => record.profile?.companyName ?? '-', width: 180 },
                    {
                      title: '客户类型',
                      render: (_, record) => (record.profile?.customerType === 'company' ? '企业' : '个人'),
                      width: 100,
                    },
                    { title: '等级', render: (_, record) => record.profile?.level?.name ?? '-', width: 120 },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      width: 90,
                      render: renderStatus,
                    },
                    { title: '报价数', render: (_, record) => record._count?.quotes ?? 0, width: 90 },
                    { title: '地址数', render: (_, record) => record._count?.addresses ?? 0, width: 90 },
                    { title: '注册时间', dataIndex: 'createdAt', width: 190 },
                    {
                      title: '操作',
                      width: 150,
                      fixed: 'right',
                      render: (_, record) => (
                        <Space>
                          <Button type="link" onClick={() => openMember(record)}>
                            编辑
                          </Button>
                          <Button type="link" onClick={() => void openDetail(record)}>
                            详情
                          </Button>
                        </Space>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
          {
            key: 'levels',
            label: '会员等级',
            children: (
              <>
                <div className="filter-bar">
                  <Button type="primary" onClick={() => openLevel('new')}>
                    新增等级
                  </Button>
                </div>
                <Table<MemberLevel>
                  rowKey="id"
                  loading={levels.loading}
                  dataSource={levels.data}
                  columns={[
                    { title: '等级名称', dataIndex: 'name' },
                    { title: '编码', dataIndex: 'code', width: 160 },
                    { title: '折扣率', dataIndex: 'discountRate', width: 120 },
                    { title: '优先级', dataIndex: 'priority', width: 100 },
                    { title: '备注', dataIndex: 'remark' },
                    {
                      title: '操作',
                      width: 100,
                      render: (_, record) => (
                        <Button type="link" onClick={() => openLevel(record)}>
                          编辑
                        </Button>
                      ),
                    },
                  ]}
                />
              </>
            ),
          },
        ]}
      />

      <Modal
        title={memberModal === 'new' ? '新增会员' : '编辑会员'}
        open={Boolean(memberModal)}
        onCancel={() => setMemberModal(null)}
        onOk={submitMember}
        width={720}
        destroyOnClose
      >
        <Form form={memberForm} layout="vertical">
          <Form.Item name="nickname" label="昵称">
            <Input />
          </Form.Item>
          <Form.Item name="mobile" label="手机号">
            <Input />
          </Form.Item>
          <Form.Item name="wxOpenid" label="微信用户标识">
            <Input placeholder="后台手动创建时可留空" />
          </Form.Item>
          <Form.Item name="status" label="状态" rules={[{ required: true }]}>
            <Select options={statusOptions} />
          </Form.Item>
          <Form.Item name="customerType" label="客户类型" rules={[{ required: true }]}>
            <Select options={customerTypeOptions} />
          </Form.Item>
          <Form.Item name="contactName" label="联系人">
            <Input />
          </Form.Item>
          <Form.Item name="companyName" label="企业名称">
            <Input />
          </Form.Item>
          <Form.Item name="taxNo" label="税号">
            <Input />
          </Form.Item>
          <Form.Item name="industry" label="所属行业">
            <Input />
          </Form.Item>
          <Form.Item name="source" label="来源">
            <Input placeholder="例如：前台注册、后台录入、微信导入" />
          </Form.Item>
          <Form.Item name="levelId" label="会员等级">
            <Select allowClear options={levelOptions} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={levelModal === 'new' ? '新增会员等级' : '编辑会员等级'}
        open={Boolean(levelModal)}
        onCancel={() => setLevelModal(null)}
        onOk={submitLevel}
        width={560}
        destroyOnClose
      >
        <Form form={levelForm} layout="vertical">
          <Form.Item name="name" label="等级名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          {levelModal === 'new' ? (
            <Form.Item name="code" label="编码" rules={[{ required: true }]}>
              <Input />
            </Form.Item>
          ) : null}
          <Form.Item name="discountRate" label="折扣率" rules={[{ required: true }]}>
            <InputNumber min={0.01} max={1} step={0.01} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="priority" label="优先级">
            <InputNumber min={0} max={9999} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={`会员详情 ${detailModal?.profile?.memberNo ?? ''}`}
        open={Boolean(detailModal)}
        onCancel={() => setDetailModal(null)}
        footer={null}
        width={760}
      >
        <Space direction="vertical" size="middle" style={{ width: '100%' }}>
          <Table
            rowKey="label"
            pagination={false}
            dataSource={[
              { label: '会员系统编号', value: detailModal?.id },
              { label: '昵称', value: detailModal?.nickname },
              { label: '手机号', value: detailModal?.mobile },
              { label: '微信用户标识', value: detailModal?.wxOpenid },
              { label: '会员编号', value: detailModal?.profile?.memberNo },
              { label: '等级', value: detailModal?.profile?.level?.name },
              { label: '来源', value: detailModal?.profile?.source },
              { label: '备注', value: detailModal?.profile?.remark },
            ]}
            columns={[
              { title: '字段', dataIndex: 'label', width: 160 },
              { title: '值', dataIndex: 'value' },
            ]}
          />
          <Table
            rowKey="id"
            pagination={false}
            dataSource={detailModal?.addresses ?? []}
            columns={[
              { title: '收件人', dataIndex: 'consignee', width: 120 },
              { title: '手机号', dataIndex: 'mobile', width: 140 },
              {
                title: '地址',
                render: (_, record) =>
                  `${record.province} ${record.city} ${record.district ?? ''} ${record.detail}`,
              },
              {
                title: '默认',
                dataIndex: 'isDefault',
                width: 80,
                render: (value: boolean) => (value ? <Tag color="blue">默认</Tag> : '-'),
              },
            ]}
          />
        </Space>
      </Modal>
    </div>
  );
}

function renderStatus(value: string) {
  return <Tag color={value === 'active' ? 'green' : 'default'}>{value === 'active' ? '启用' : '停用'}</Tag>;
}
