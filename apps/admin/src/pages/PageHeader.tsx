import { Button, Typography } from 'antd';

interface PageHeaderProps {
  title: string;
  description?: string;
  onRefresh?: () => void;
  extra?: React.ReactNode;
}

export function PageHeader({ title, description, onRefresh, extra }: PageHeaderProps) {
  return (
    <div className="toolbar">
      <div>
        <Typography.Title level={4} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {description ? <Typography.Text className="muted">{description}</Typography.Text> : null}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {extra}
        {onRefresh ? <Button onClick={onRefresh}>刷新</Button> : null}
      </div>
    </div>
  );
}
