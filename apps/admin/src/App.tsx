import { App as AntApp, Layout, Menu, Typography } from 'antd';
import { useMemo, useState } from 'react';
import { InventoryPage } from './pages/InventoryPage';
import { MaterialsPage } from './pages/MaterialsPage';
import { OperationLogsPage } from './pages/OperationLogsPage';
import { ProcessesPage } from './pages/ProcessesPage';
import { ProductsPage } from './pages/ProductsPage';
import { QuoteRulesPage } from './pages/QuoteRulesPage';
import { QuotesPage } from './pages/QuotesPage';

const { Header, Sider, Content } = Layout;

const menuItems = [
  { key: 'products', label: '产品与模板' },
  { key: 'materials', label: '材料与价格' },
  { key: 'processes', label: '工艺与印刷' },
  { key: 'rules', label: '报价规则' },
  { key: 'quotes', label: '报价单' },
  { key: 'inventory', label: '库存' },
  { key: 'logs', label: '操作日志' },
];

export default function App() {
  const [activeKey, setActiveKey] = useState('products');

  const page = useMemo(() => {
    switch (activeKey) {
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
      case 'inventory':
        return <InventoryPage />;
      case 'logs':
        return <OperationLogsPage />;
      default:
        return <ProductsPage />;
    }
  }, [activeKey]);

  return (
    <AntApp>
      <Layout className="app-shell">
        <Header className="app-header">
          <Typography.Text className="app-title">不干胶印刷报价后台</Typography.Text>
        </Header>
        <Layout>
          <Sider width={208} theme="light">
            <Menu
              mode="inline"
              selectedKeys={[activeKey]}
              items={menuItems}
              onClick={(item) => setActiveKey(item.key)}
              style={{ height: '100%', borderRight: 0, paddingTop: 12 }}
            />
          </Sider>
          <Content className="app-content">{page}</Content>
        </Layout>
      </Layout>
    </AntApp>
  );
}
