import { useCallback, useEffect, useState } from 'react';

export function useApi(request, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const run = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await request();
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Request failed');
      throw err;
    } finally {
      setLoading(false);
    }
  }, dependencies);

  useEffect(() => {
    run().catch(() => {});
  }, [run]);

  return { data, loading, error, reload: run };
}
