import {
  Alert,
  App,
  Button,
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
} from 'antd';
import { useEffect, useMemo, useState } from 'react';
import { hasAdminPermission, post, put, request, toAbsoluteAssetUrl, uploadContentAsset } from '../api';
import type {
  CategoryEquipmentShowcase,
  CompanyProfile,
  HomepageBanner,
  HomepageBranding,
  ProductCategory,
} from '../types';
import { PageHeader } from './PageHeader';
import { useRemoteList } from './useRemoteList';

type CompanyProfileFormValues = {
  title: string;
  subtitle?: string;
  coverImage?: string;
  gallery?: string[];
  content?: string;
  contactPhone?: string;
  contactWechat?: string;
  address?: string;
  sort?: number;
  status?: string;
};

type BrandingFormValues = {
  siteName: string;
  siteSubtitle?: string;
  logoImage?: string;
  headerNotice?: string;
  status?: string;
};

type BannerFormValues = {
  title: string;
  subtitle?: string;
  imageUrl: string;
  mobileImageUrl?: string;
  linkType?: string;
  linkValue?: string;
  buttonText?: string;
  sort?: number;
  status?: string;
  startAt?: string;
  endAt?: string;
};

type ShowcaseFormValues = {
  categoryId: string;
  name: string;
  title?: string;
  description?: string;
  imageUrl?: string;
  gallery?: string[];
  specsText?: string;
  sort?: number;
  status?: string;
};

type UploadRequestOptions = {
  file: unknown;
  onSuccess?: (body: unknown, file: File) => void;
  onError?: (error: Error) => void;
};

export function ContentManagementPage() {
  const { message } = App.useApp();
  const canWrite = hasAdminPermission('admin:content');
  const [activeTab, setActiveTab] = useState('company');
  const [companyProfile, setCompanyProfile] = useState<CompanyProfile | null>(null);
  const [homepageBranding, setHomepageBranding] = useState<HomepageBranding | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const { data: banners, loading: loadingBanners, reload: reloadBanners } =
    useRemoteList<HomepageBanner>('/admin/homepage-banners');
  const { data: showcases, loading: loadingShowcases, reload: reloadShowcases } =
    useRemoteList<CategoryEquipmentShowcase>('/admin/category-equipment-showcases');
  const { data: categories, reload: reloadCategories } =
    useRemoteList<ProductCategory>('/admin/product-categories');
  const [companyForm] = Form.useForm<CompanyProfileFormValues>();
  const [brandingForm] = Form.useForm<BrandingFormValues>();
  const [bannerForm] = Form.useForm<BannerFormValues>();
  const [showcaseForm] = Form.useForm<ShowcaseFormValues>();
  const [bannerModalOpen, setBannerModalOpen] = useState(false);
  const [showcaseModalOpen, setShowcaseModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<HomepageBanner | null>(null);
  const [editingShowcase, setEditingShowcase] = useState<CategoryEquipmentShowcase | null>(null);
  const [savingCompany, setSavingCompany] = useState(false);
  const [savingBranding, setSavingBranding] = useState(false);
  const [savingBanner, setSavingBanner] = useState(false);
  const [savingShowcase, setSavingShowcase] = useState(false);
  const [bannerKeyword, setBannerKeyword] = useState('');
  const [bannerStatus, setBannerStatus] = useState<string>();
  const [showcaseKeyword, setShowcaseKeyword] = useState('');
  const [showcaseCategory, setShowcaseCategory] = useState<string>();

  useEffect(() => {
    void refreshSummary();
  }, []);

  async function refreshSummary() {
    setLoadingSummary(true);
    try {
      const [company, branding] = await Promise.all([
        request<CompanyProfile | null>('/admin/company-profile'),
        request<HomepageBranding | null>('/admin/homepage-branding'),
      ]);
      setCompanyProfile(company);
      setHomepageBranding(branding);
      companyForm.setFieldsValue({
        title: company?.title ?? '',
        subtitle: company?.subtitle ?? '',
        coverImage: company?.coverImage ?? '',
        gallery: company?.galleryJson ?? [],
        content: company?.content ?? '',
        contactPhone: company?.contactPhone ?? '',
        contactWechat: company?.contactWechat ?? '',
        address: company?.address ?? '',
        sort: company?.sort ?? 0,
        status: company?.status ?? 'active',
      });
      brandingForm.setFieldsValue({
        siteName: branding?.siteName ?? '',
        siteSubtitle: branding?.siteSubtitle ?? '',
        logoImage: branding?.logoImage ?? '',
        headerNotice: branding?.headerNotice ?? '',
        status: branding?.status ?? 'active',
      });
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载内容配置失败。');
    } finally {
      setLoadingSummary(false);
    }
  }

  async function refreshAll() {
    await Promise.all([refreshSummary(), reloadBanners(), reloadShowcases(), reloadCategories()]);
  }

  async function submitCompanyProfile() {
    const values = await companyForm.validateFields();
    setSavingCompany(true);
    try {
      const payload = {
        ...values,
        gallery: normalizeStringArray(values.gallery),
      };
      const saved = await post<CompanyProfile>('/admin/company-profile', payload);
      setCompanyProfile(saved);
      companyForm.setFieldsValue({
        ...values,
        gallery: payload.gallery,
      });
      message.success('企业介绍已更新。');
    } finally {
      setSavingCompany(false);
    }
  }

  async function submitHomepageBranding() {
    const values = await brandingForm.validateFields();
    setSavingBranding(true);
    try {
      const saved = await post<HomepageBranding>('/admin/homepage-branding', values);
      setHomepageBranding(saved);
      message.success('首页头部配置已更新。');
    } finally {
      setSavingBranding(false);
    }
  }

  function openCreateBanner() {
    setEditingBanner(null);
    bannerForm.resetFields();
    bannerForm.setFieldsValue({
      linkType: 'none',
      sort: 0,
      status: 'active',
    });
    setBannerModalOpen(true);
  }

  function openEditBanner(record: HomepageBanner) {
    setEditingBanner(record);
    bannerForm.setFieldsValue({
      title: record.title,
      subtitle: record.subtitle,
      imageUrl: record.imageUrl,
      mobileImageUrl: record.mobileImageUrl,
      linkType: record.linkType || 'none',
      linkValue: record.linkValue,
      buttonText: record.buttonText,
      sort: record.sort,
      status: record.status,
      startAt: toDateTimeInput(record.startAt),
      endAt: toDateTimeInput(record.endAt),
    });
    setBannerModalOpen(true);
  }

  async function submitBanner() {
    const values = await bannerForm.validateFields();
    setSavingBanner(true);
    try {
      const payload = {
        ...values,
        linkValue: values.linkType === 'none' ? undefined : values.linkValue,
        startAt: normalizeDateTimeInput(values.startAt),
        endAt: normalizeDateTimeInput(values.endAt),
      };
      if (editingBanner) {
        await put(`/admin/homepage-banners/${editingBanner.id}`, payload);
        message.success('Banner 已更新。');
      } else {
        await post('/admin/homepage-banners', payload);
        message.success('Banner 已创建。');
      }
      setBannerModalOpen(false);
      setEditingBanner(null);
      bannerForm.resetFields();
      await reloadBanners();
    } finally {
      setSavingBanner(false);
    }
  }

  function openCreateShowcase() {
    setEditingShowcase(null);
    showcaseForm.resetFields();
    showcaseForm.setFieldsValue({
      sort: 0,
      status: 'active',
      gallery: [],
      specsText: '{}',
    });
    setShowcaseModalOpen(true);
  }

  function openEditShowcase(record: CategoryEquipmentShowcase) {
    setEditingShowcase(record);
    showcaseForm.setFieldsValue({
      categoryId: String(record.categoryId),
      name: record.name,
      title: record.title,
      description: record.description,
      imageUrl: record.imageUrl,
      gallery: record.galleryJson ?? [],
      specsText: JSON.stringify(record.specsJson ?? {}, null, 2),
      sort: record.sort,
      status: record.status,
    });
    setShowcaseModalOpen(true);
  }

  async function submitShowcase() {
    const values = await showcaseForm.validateFields();
    setSavingShowcase(true);
    try {
      const payload = {
        categoryId: Number(values.categoryId),
        name: values.name,
        title: values.title,
        description: values.description,
        imageUrl: values.imageUrl,
        gallery: normalizeStringArray(values.gallery),
        specs: parseJsonObject(values.specsText),
        sort: values.sort,
        status: values.status,
      };
      if (editingShowcase) {
        await put(`/admin/category-equipment-showcases/${editingShowcase.id}`, payload);
        message.success('设备展示已更新。');
      } else {
        await post('/admin/category-equipment-showcases', payload);
        message.success('设备展示已创建。');
      }
      setShowcaseModalOpen(false);
      setEditingShowcase(null);
      showcaseForm.resetFields();
      await reloadShowcases();
    } finally {
      setSavingShowcase(false);
    }
  }

  const categoryOptions = useMemo(
    () =>
      categories.map((item) => ({
        value: String(item.id),
        label: item.name,
      })),
    [categories],
  );

  const filteredBanners = useMemo(() => {
    const keyword = bannerKeyword.trim().toLowerCase();
    return banners.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        (item.subtitle ?? '').toLowerCase().includes(keyword);
      const matchStatus = bannerStatus ? item.status === bannerStatus : true;
      return matchKeyword && matchStatus;
    });
  }, [bannerKeyword, bannerStatus, banners]);

  const filteredShowcases = useMemo(() => {
    const keyword = showcaseKeyword.trim().toLowerCase();
    return showcases.filter((item) => {
      const matchKeyword =
        !keyword ||
        item.name.toLowerCase().includes(keyword) ||
        (item.title ?? '').toLowerCase().includes(keyword) ||
        (item.description ?? '').toLowerCase().includes(keyword);
      const matchCategory = showcaseCategory ? String(item.categoryId) === showcaseCategory : true;
      return matchKeyword && matchCategory;
    });
  }, [showcaseKeyword, showcaseCategory, showcases]);

  const currentBannerLinkType = Form.useWatch('linkType', bannerForm);

  return (
    <div className="page-card">
      <PageHeader
        title="内容管理"
        description="统一维护企业介绍、首页头部配置和分类设备展示。"
        onRefresh={refreshAll}
      />

      <Alert
        className="inline-alert"
        type="info"
        showIcon
        message="使用建议"
        description="先维护首页 Logo 和 Banner，再补企业介绍和分类设备展示。图片支持直接上传，也支持粘贴已有地址。"
      />

      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: 'company',
            label: '企业介绍',
            children: (
              <Space direction="vertical" size={20} style={{ display: 'flex' }}>
                <ContentPreviewCard
                  title="前台预览"
                  subtitle={companyProfile?.subtitle || '企业介绍'}
                  image={companyProfile?.coverImage}
                  lines={[
                    companyProfile?.title || '未配置标题',
                    companyProfile?.content || '企业介绍内容会显示在 H5 首页和小程序首页。',
                    companyProfile?.contactPhone ? `电话：${companyProfile.contactPhone}` : '',
                    companyProfile?.address ? `地址：${companyProfile.address}` : '',
                  ]}
                />

                <Form form={companyForm} layout="vertical" disabled={loadingSummary || !canWrite}>
                  <div className="content-grid">
                    <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
                      <Input maxLength={80} />
                    </Form.Item>
                    <Form.Item name="subtitle" label="副标题">
                      <Input maxLength={120} />
                    </Form.Item>
                    <Form.Item name="contactPhone" label="联系电话">
                      <Input maxLength={32} />
                    </Form.Item>
                    <Form.Item name="contactWechat" label="微信号">
                      <Input maxLength={64} />
                    </Form.Item>
                    <Form.Item name="sort" label="排序">
                      <InputNumber min={0} max={9999} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                      <Select
                        options={[
                          { value: 'active', label: '启用' },
                          { value: 'inactive', label: '停用' },
                        ]}
                      />
                    </Form.Item>
                  </div>
                  <Form.Item name="coverImage" label="封面图">
                    <SingleImageInput />
                  </Form.Item>
                  <Form.Item name="gallery" label="图集">
                    <MultiImageInput />
                  </Form.Item>
                  <Form.Item name="address" label="地址">
                    <Input.TextArea rows={2} />
                  </Form.Item>
                  <Form.Item name="content" label="介绍正文">
                    <Input.TextArea rows={8} placeholder="可填写企业介绍、能力说明、服务优势等内容。" />
                  </Form.Item>
                  <Space>
                    <Button type="primary" onClick={submitCompanyProfile} loading={savingCompany} disabled={!canWrite}>
                      保存企业介绍
                    </Button>
                    {companyProfile ? <Typography.Text className="muted">当前记录 ID: {companyProfile.id}</Typography.Text> : null}
                  </Space>
                </Form>
              </Space>
            ),
          },
          {
            key: 'homepage',
            label: '首页头部',
            children: (
              <Space direction="vertical" size={24} style={{ display: 'flex' }}>
                <ContentPreviewCard
                  title={homepageBranding?.siteName || '未配置站点名称'}
                  subtitle={homepageBranding?.siteSubtitle || '首页头部预览'}
                  image={homepageBranding?.logoImage}
                  lines={[
                    homepageBranding?.headerNotice || '头部文案会显示在 H5 顶部和小程序首页。',
                  ]}
                />

                <Form form={brandingForm} layout="vertical" disabled={loadingSummary || !canWrite}>
                  <div className="content-grid">
                    <Form.Item name="siteName" label="站点名称" rules={[{ required: true, message: '请输入站点名称' }]}>
                      <Input maxLength={80} />
                    </Form.Item>
                    <Form.Item name="siteSubtitle" label="站点副标题">
                      <Input maxLength={120} />
                    </Form.Item>
                    <Form.Item name="status" label="状态">
                      <Select
                        options={[
                          { value: 'active', label: '启用' },
                          { value: 'inactive', label: '停用' },
                        ]}
                      />
                    </Form.Item>
                  </div>
                  <Form.Item name="logoImage" label="Logo">
                    <SingleImageInput />
                  </Form.Item>
                  <Form.Item name="headerNotice" label="头部文案">
                    <Input.TextArea rows={3} />
                  </Form.Item>
                  <Space>
                    <Button type="primary" onClick={submitHomepageBranding} loading={savingBranding} disabled={!canWrite}>
                      保存头部配置
                    </Button>
                    {homepageBranding ? <Typography.Text className="muted">当前记录 ID: {homepageBranding.id}</Typography.Text> : null}
                  </Space>
                </Form>

                <div>
                  <div className="section-header">
                    <div>
                      <Typography.Title level={5} style={{ margin: 0 }}>
                        Banner 配置
                      </Typography.Title>
                      <Typography.Text className="muted">支持 PC 图、移动图、跳转信息和生效时间。</Typography.Text>
                    </div>
                    {canWrite ? (
                      <Button type="primary" onClick={openCreateBanner}>
                        新增 Banner
                      </Button>
                    ) : null}
                  </div>

                  <div className="filter-bar">
                    <Input.Search
                      allowClear
                      style={{ width: 240 }}
                      placeholder="搜索标题或副标题"
                      value={bannerKeyword}
                      onChange={(event) => setBannerKeyword(event.target.value)}
                    />
                    <Select
                      allowClear
                      placeholder="状态"
                      style={{ width: 140 }}
                      value={bannerStatus}
                      onChange={(value) => setBannerStatus(value)}
                      options={[
                        { value: 'active', label: '启用' },
                        { value: 'inactive', label: '停用' },
                      ]}
                    />
                  </div>

                  <Table<HomepageBanner>
                    rowKey="id"
                    dataSource={filteredBanners}
                    loading={loadingBanners}
                    pagination={{ pageSize: 10 }}
                    columns={[
                      { title: 'ID', dataIndex: 'id', width: 90 },
                      {
                        title: 'Banner',
                        dataIndex: 'title',
                        render: (_, record) => (
                          <Space align="start">
                            {record.imageUrl ? <img src={toAbsoluteAssetUrl(record.imageUrl)} alt={record.title} className="table-thumb" /> : null}
                            <div>
                              <div>{record.title}</div>
                              <Typography.Text className="muted">{record.subtitle || '无副标题'}</Typography.Text>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: '跳转',
                        width: 220,
                        render: (_, record) => (
                          <div>
                            <div>{record.linkType || 'none'}</div>
                            <Typography.Text className="muted">{record.linkValue || '无跳转值'}</Typography.Text>
                          </div>
                        ),
                      },
                      { title: '排序', dataIndex: 'sort', width: 100 },
                      {
                        title: '状态',
                        dataIndex: 'status',
                        width: 100,
                        render: (value: string) => <StatusTag value={value} />,
                      },
                      canWrite
                        ? {
                            title: '操作',
                            width: 120,
                            render: (_: unknown, record: HomepageBanner) => (
                              <Button type="link" onClick={() => openEditBanner(record)}>
                                编辑
                              </Button>
                            ),
                          }
                        : {},
                    ]}
                  />
                </div>
              </Space>
            ),
          },
          {
            key: 'showcases',
            label: '分类设备展示',
            children: (
              <div>
                <div className="section-header">
                  <div>
                    <Typography.Title level={5} style={{ margin: 0 }}>
                      设备展示列表
                    </Typography.Title>
                    <Typography.Text className="muted">为不同产品分类配置设备图片、说明和参数。</Typography.Text>
                  </div>
                  {canWrite ? (
                    <Button type="primary" onClick={openCreateShowcase}>
                      新增设备展示
                    </Button>
                  ) : null}
                </div>

                <div className="filter-bar">
                  <Input.Search
                    allowClear
                    style={{ width: 240 }}
                    placeholder="搜索设备名称或说明"
                    value={showcaseKeyword}
                    onChange={(event) => setShowcaseKeyword(event.target.value)}
                  />
                  <Select
                    allowClear
                    placeholder="所属分类"
                    style={{ width: 180 }}
                    value={showcaseCategory}
                    onChange={(value) => setShowcaseCategory(value)}
                    options={categoryOptions}
                  />
                </div>

                <Table<CategoryEquipmentShowcase>
                  rowKey="id"
                  dataSource={filteredShowcases}
                  loading={loadingShowcases}
                  pagination={{ pageSize: 10 }}
                  columns={[
                    { title: 'ID', dataIndex: 'id', width: 90 },
                    {
                      title: '设备',
                      dataIndex: 'name',
                      render: (_, record) => (
                        <Space align="start">
                          {record.imageUrl ? <img src={toAbsoluteAssetUrl(record.imageUrl)} alt={record.name} className="table-thumb" /> : null}
                          <div>
                            <div>{record.name}</div>
                            <Typography.Text className="muted">{record.title || '未填写展示标题'}</Typography.Text>
                          </div>
                        </Space>
                      ),
                    },
                    {
                      title: '所属分类',
                      dataIndex: ['category', 'name'],
                      width: 180,
                      render: (_, record) => record.category?.name ?? record.categoryId,
                    },
                    {
                      title: '图集 / 参数',
                      width: 120,
                      render: (_, record) => (
                        <div>
                          <div>{record.galleryJson?.length ?? 0} 张图</div>
                          <Typography.Text className="muted">{Object.keys(record.specsJson ?? {}).length} 个参数</Typography.Text>
                        </div>
                      ),
                    },
                    { title: '排序', dataIndex: 'sort', width: 100 },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      width: 100,
                      render: (value: string) => <StatusTag value={value} />,
                    },
                    canWrite
                      ? {
                          title: '操作',
                          width: 120,
                          render: (_: unknown, record: CategoryEquipmentShowcase) => (
                            <Button type="link" onClick={() => openEditShowcase(record)}>
                              编辑
                            </Button>
                          ),
                        }
                      : {},
                  ]}
                />
              </div>
            ),
          },
        ]}
      />

      <Modal
        open={bannerModalOpen}
        title={editingBanner ? '编辑 Banner' : '新增 Banner'}
        onCancel={() => setBannerModalOpen(false)}
        onOk={submitBanner}
        confirmLoading={savingBanner}
        width={760}
        destroyOnClose
      >
        <Form form={bannerForm} layout="vertical">
          <div className="content-grid">
            <Form.Item name="title" label="标题" rules={[{ required: true, message: '请输入标题' }]}>
              <Input maxLength={80} />
            </Form.Item>
            <Form.Item name="subtitle" label="副标题">
              <Input maxLength={120} />
            </Form.Item>
            <Form.Item name="linkType" label="跳转类型">
              <Select
                options={[
                  { value: 'none', label: '无跳转' },
                  { value: 'product', label: '产品' },
                  { value: 'category', label: '分类' },
                  { value: 'custom', label: '自定义链接' },
                ]}
              />
            </Form.Item>
            <Form.Item
              name="linkValue"
              label="跳转值"
              rules={[
                {
                  validator: (_, value) => {
                    if (!currentBannerLinkType || currentBannerLinkType === 'none') {
                      return Promise.resolve();
                    }
                    if (!value?.trim()) {
                      return Promise.reject(new Error('当前跳转类型需要填写跳转值。'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input maxLength={255} placeholder="产品 ID、分类 ID 或自定义链接" disabled={!currentBannerLinkType || currentBannerLinkType === 'none'} />
            </Form.Item>
            <Form.Item name="buttonText" label="按钮文案">
              <Input maxLength={40} />
            </Form.Item>
            <Form.Item name="sort" label="排序">
              <InputNumber min={0} max={9999} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { value: 'active', label: '启用' },
                  { value: 'inactive', label: '停用' },
                ]}
              />
            </Form.Item>
            <Form.Item name="startAt" label="开始时间">
              <Input type="datetime-local" />
            </Form.Item>
            <Form.Item
              name="endAt"
              label="结束时间"
              rules={[
                {
                  validator: (_, value) => {
                    const startAt = bannerForm.getFieldValue('startAt');
                    if (!startAt || !value) {
                      return Promise.resolve();
                    }
                    if (new Date(value).getTime() < new Date(startAt).getTime()) {
                      return Promise.reject(new Error('结束时间不能早于开始时间。'));
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <Input type="datetime-local" />
            </Form.Item>
          </div>
          <Form.Item name="imageUrl" label="Banner 图片" rules={[{ required: true, message: '请上传 Banner 图片' }]}>
            <SingleImageInput />
          </Form.Item>
          <Form.Item name="mobileImageUrl" label="移动端图片">
            <SingleImageInput />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={showcaseModalOpen}
        title={editingShowcase ? '编辑设备展示' : '新增设备展示'}
        onCancel={() => setShowcaseModalOpen(false)}
        onOk={submitShowcase}
        confirmLoading={savingShowcase}
        width={760}
        destroyOnClose
      >
        <Form form={showcaseForm} layout="vertical">
          <div className="content-grid">
            <Form.Item name="categoryId" label="所属分类" rules={[{ required: true, message: '请选择所属分类' }]}>
              <Select options={categoryOptions} />
            </Form.Item>
            <Form.Item name="name" label="设备名称" rules={[{ required: true, message: '请输入设备名称' }]}>
              <Input maxLength={80} />
            </Form.Item>
            <Form.Item name="title" label="展示标题">
              <Input maxLength={120} />
            </Form.Item>
            <Form.Item name="sort" label="排序">
              <InputNumber min={0} max={9999} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="status" label="状态">
              <Select
                options={[
                  { value: 'active', label: '启用' },
                  { value: 'inactive', label: '停用' },
                ]}
              />
            </Form.Item>
          </div>
          <Form.Item name="imageUrl" label="主图">
            <SingleImageInput />
          </Form.Item>
          <Form.Item name="gallery" label="详情图集">
            <MultiImageInput />
          </Form.Item>
          <Form.Item name="description" label="说明">
            <Input.TextArea rows={4} />
          </Form.Item>
          <Form.Item name="specsText" label="规格参数 JSON" rules={[{ validator: validateJsonObjectField }]}>
            <Input.TextArea rows={8} placeholder='{"speed":"120m/min","precision":"+-0.2mm"}' />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

function ContentPreviewCard({
  title,
  subtitle,
  image,
  lines,
}: {
  title: string;
  subtitle: string;
  image?: string;
  lines: string[];
}) {
  return (
    <Card size="small" className="preview-card">
      <div className="preview-card-layout">
        {image ? <img src={toAbsoluteAssetUrl(image)} alt={title} className="preview-card-image" /> : <div className="preview-card-image preview-card-placeholder" />}
        <div className="preview-card-copy">
          <Typography.Text className="muted">{subtitle}</Typography.Text>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {lines.filter(Boolean).map((line, index) => (
            <Typography.Paragraph key={`${line}-${index}`} className="preview-line">
              {line}
            </Typography.Paragraph>
          ))}
        </div>
      </div>
    </Card>
  );
}

function SingleImageInput({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (value: string) => void;
}) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const result = await uploadContentAsset(file);
      onChange?.(result.url);
      message.success('图片上传成功。');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '图片上传失败。');
    } finally {
      setUploading(false);
    }
  }

  function copyValue() {
    if (!value) {
      return;
    }
    navigator.clipboard
      .writeText(value)
      .then(() => message.success('图片地址已复制。'))
      .catch(() => message.error('复制失败，请手动复制。'));
  }

  return (
    <Space direction="vertical" style={{ display: 'flex' }}>
      <Input value={value} onChange={(event) => onChange?.(event.target.value)} placeholder="/uploads/content/example.png" />
      <Space wrap>
        <Upload accept="image/*" showUploadList={false} customRequest={(options) => void runUploadRequest(options, handleFile)}>
          <Button loading={uploading}>上传图片</Button>
        </Upload>
        {value ? <Button onClick={copyValue}>复制地址</Button> : null}
        {value ? <Button onClick={() => onChange?.('')}>清空</Button> : null}
      </Space>
      {value ? <img src={toAbsoluteAssetUrl(value)} alt="preview" className="content-image-preview" /> : null}
    </Space>
  );
}

function MultiImageInput({
  value,
  onChange,
}: {
  value?: string[];
  onChange?: (value: string[]) => void;
}) {
  const { message } = App.useApp();
  const [uploading, setUploading] = useState(false);
  const urls = normalizeStringArray(value);

  async function handleFile(file: File) {
    setUploading(true);
    try {
      const result = await uploadContentAsset(file);
      onChange?.([...urls, result.url]);
      message.success('图片上传成功。');
    } catch (error) {
      message.error(error instanceof Error ? error.message : '图片上传失败。');
    } finally {
      setUploading(false);
    }
  }

  function removeAt(index: number) {
    onChange?.(urls.filter((_, currentIndex) => currentIndex !== index));
  }

  return (
    <Space direction="vertical" style={{ display: 'flex' }}>
      <Select
        mode="tags"
        value={urls}
        onChange={(next) => onChange?.(normalizeStringArray(next))}
        tokenSeparators={[',']}
        placeholder="可粘贴图片地址，也可点击上传。"
      />
      <Upload accept="image/*" multiple showUploadList={false} customRequest={(options) => void runUploadRequest(options, handleFile)}>
        <Button loading={uploading}>上传图片到图集</Button>
      </Upload>
      <div className="image-grid">
        {urls.map((item, index) => (
          <div key={`${item}-${index}`} className="image-grid-item">
            <img src={toAbsoluteAssetUrl(item)} alt={`gallery-${index + 1}`} className="content-image-preview" />
            <Button size="small" onClick={() => removeAt(index)}>
              移除
            </Button>
          </div>
        ))}
      </div>
    </Space>
  );
}

function StatusTag({ value }: { value?: string }) {
  return <Tag color={value === 'active' ? 'green' : 'default'}>{value === 'active' ? '启用' : '停用'}</Tag>;
}

function normalizeStringArray(value?: string[]) {
  return (value ?? []).filter((item): item is string => typeof item === 'string' && item.trim().length > 0);
}

function parseJsonObject(value?: string) {
  if (!value?.trim()) {
    return {};
  }
  const parsed = JSON.parse(value) as unknown;
  if (!parsed || Array.isArray(parsed) || typeof parsed !== 'object') {
    throw new Error('规格参数必须是 JSON 对象。');
  }
  return parsed as Record<string, unknown>;
}

function validateJsonObjectField(_: unknown, value?: string) {
  if (!value?.trim()) {
    return Promise.resolve();
  }

  try {
    parseJsonObject(value);
    return Promise.resolve();
  } catch (error) {
    return Promise.reject(error instanceof Error ? error.message : '请输入合法的 JSON 对象。');
  }
}

function normalizeDateTimeInput(value?: string) {
  if (!value) {
    return null;
  }
  return new Date(value).toISOString();
}

function toDateTimeInput(value?: string | null) {
  if (!value) {
    return '';
  }
  const date = new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

async function runUploadRequest(options: UploadRequestOptions, handler: (file: File) => Promise<void>) {
  const file = options.file as File;
  try {
    await handler(file);
    options.onSuccess?.({}, file);
  } catch (error) {
    options.onError?.(error as Error);
  }
}
