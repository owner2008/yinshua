import { App } from 'antd';
import { useCallback, useEffect, useState } from 'react';
import { request } from '../api';

export function useRemoteList<T>(path: string) {
  const { message } = App.useApp();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setData(await request<T[]>(path));
    } catch (error) {
      message.error(error instanceof Error ? error.message : '加载失败');
    } finally {
      setLoading(false);
    }
  }, [message, path]);

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, reload };
}
