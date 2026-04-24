import { App as AntApp, Button, Form, Input, Layout, Menu, Space, Spin, Typography } from 'antd';
import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { AdminSession, clearAdminSession, getAdminSession, loginAdmin, saveAdminSession } from './api';

const { Header, Sider, Content } = Layout;

const ProductsPage = lazy(() => import('./pages/ProductsPage').then((module) => ({ default: module.ProductsPage })));
const ProductCategoriesPage = lazy(() =>
  import('./pages/ProductCategoriesPage').then((module) => ({ default: module.ProductCategoriesPage })),
);
const MaterialsPage = lazy(() => import('./pages/MaterialsPage').then((module) => ({ default: module.MaterialsPage })));
const ProcessesPage = lazy(() => import('./pages/ProcessesPage').then((module) => ({ default: module.ProcessesPage })));
const QuoteRulesPage = lazy(() => import('./pages/QuoteRulesPage').then((module) => ({ default: module.QuoteRulesPage })));
const QuotesPage = lazy(() => import('./pages/QuotesPage').then((module) => ({ default: module.QuotesPage })));
const MembersPage = lazy(() => import('./pages/MembersPage').then((module) => ({ default: module.MembersPage })));
const ContentManagementPage = lazy(() =>
  import('./pages/ContentManagementPage').then((module) => ({ default: module.ContentManagementPage })),
);
const InventoryPage = lazy(() => import('./pages/InventoryPage').then((module) => ({ default: module.InventoryPage })));
const OperationLogsPage = lazy(() =>
  import('./pages/OperationLogsPage').then((module) => ({ default: module.OperationLogsPage })),
);
const AdminAccessPage = lazy(() =>
  import('./pages/AdminAccessPage').then((module) => ({ default: module.AdminAccessPage })),
);

const menuItems = [
  { key: 'categories', label: '产品分类', permission: 'admin:product' },
  { key: 'products', label: '产品与模板', permission: 'admin:product' },
  { key: 'materials', label: '材料与价格', permission: 'admin:pricing' },
  { key: 'processes', label: '工艺与印刷', permission: 'admin:pricing' },
  { key: 'rules', label: '报价规则', permission: 'admin:quote-rule' },
  { key: 'quotes', label: '报价单', permission: 'admin:quote' },
  { key: 'members', label: '会员管理', permission: 'admin:member' },
  { key: 'content', label: '内容管理', permission: 'admin:content' },
  { key: 'inventory', label: '库存', permission: 'admin:inventory' },
  { key: 'logs', label: '操作日志', permission: 'admin:audit-log' },
  { key: 'access', label: '权限管理', permission: 'admin:permission' },
];

export default function App() {
  const [activeKey, setActiveKey] = useState('products');
  const [session, setSession] = useState<AdminSession | null>(() => getAdminSession());
  const visibleMenuItems = useMemo(
    () => menuItems.filter((item) => !item.permission || session?.user.permissions.includes(item.permission)),
    [session],
  );

  useEffect(() => {
    const listener = () => setSession(null);
    window.addEventListener('admin-session-expired', listener);
    return () => window.removeEventListener('admin-session-expired', listener);
  }, []);

  useEffect(() => {
    if (session && !visibleMenuItems.some((item) => item.key === activeKey)) {
      setActiveKey(visibleMenuItems[0]?.key ?? 'quotes');
    }
  }, [activeKey, session, visibleMenuItems]);

  const page = useMemo(() => {
    switch (activeKey) {
      case 'categories':
        return <ProductCategoriesPage />;
      case 'products':
        return <ProductsPage />;
      case 'materials':
        return <MaterialsPage />;
      case 'processes':
        return <ProcessesPage />;
      case 'rules':
        return <QuoteRulesPage />;
      case 'quotes':
        return <QuotesPage />;
      case 'members':
        return <MembersPage />;
      case 'content':
        return <ContentManagementPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'logs':
        return <OperationLogsPage />;
      case 'access':
        return <AdminAccessPage />;
      default:
        return <ProductsPage />;
    }
  }, [activeKey]);

  function logout() {
    clearAdminSession();
    setSession(null);
  }

  return (
    <AntApp>
      {session ? (
        <Layout className="app-shell">
          <Header className="app-header">
            <Typography.Text className="app-title">不干胶印刷报价后台</Typography.Text>
            <Space className="app-user">
              <Typography.Text>{session.user.username}</Typography.Text>
              <Button size="small" onClick={logout}>
                退出
              </Button>
            </Space>
          </Header>
          <Layout>
            <Sider width={208} theme="light">
              <Menu
                mode="inline"
                selectedKeys={[activeKey]}
                items={visibleMenuItems.map(({ key, label }) => ({ key, label }))}
                onClick={(item) => setActiveKey(item.key)}
                style={{ height: '100%', borderRight: 0, paddingTop: 12 }}
              />
            </Sider>
            <Content className="app-content">
              <Suspense fallback={<PageLoading />}>{page}</Suspense>
            </Content>
          </Layout>
        </Layout>
      ) : (
        <LoginScreen onLogin={setSession} />
      )}
    </AntApp>
  );
}

function PageLoading() {
  return (
    <div className="page-loading">
      <Spin />
    </div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (session: AdminSession) => void }) {
  const { message } = AntApp.useApp();
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  async function submit() {
    const values = await form.validateFields();
    setLoading(true);
    try {
      const session = await loginAdmin(values);
      saveAdminSession(session);
      onLogin(session);
      message.success('登录成功');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <Typography.Title level={3} style={{ marginTop: 0 }}>
          不干胶印刷报价后台
        </Typography.Title>
        <Typography.Text className="muted">请输入后台账号后继续操作配置数据。</Typography.Text>
        <Form form={form} layout="vertical" className="login-form" initialValues={{ username: 'admin' }}>
          <Form.Item name="username" label="账号" rules={[{ required: true }]}>
            <Input autoComplete="username" />
          </Form.Item>
          <Form.Item name="password" label="密码" rules={[{ required: true }]}>
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Button type="primary" block loading={loading} onClick={submit}>
            登录
          </Button>
        </Form>
      </div>
    </div>
  );
}
