import { useEffect, useRef, useState } from 'react';

export type UseFetchResult<T> =
  | {
      status: 'loading';
    }
  | {
      status: 'loaded';
      data: T;
    }
  | {
      status: 'error';
      error: Error;
    };

export function useFetch<T>(fn: () => Promise<T>): UseFetchResult<T> {
  const [state, setState] = useState<UseFetchResult<T>>({ status: 'loading' });
  const fnRef = useRef(fn);

  useEffect(() => {
    let isMounted = true;
    fnRef
      .current()
      .then((response) => {
        if (isMounted) {
          setState({
            status: 'loaded',
            data: response,
          });
        }
      })
      .catch((error) => {
        setState({
          status: 'error',
          error,
        });
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return state;
}
