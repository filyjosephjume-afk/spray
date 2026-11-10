import { useCallback, useEffect, useState } from 'react';
import { errMsg } from '../api/axios';

// Charge des données au démarrage de la page.
//   const { data, loading, error, reload } = useFetch(() => actifs.list());
// reload() relance le chargement ; "deps" relance aussi quand une valeur change.
export default function useFetch(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError('');
    Promise.resolve()
      .then(() => fetcher())
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(errMsg(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload, setData };
}
