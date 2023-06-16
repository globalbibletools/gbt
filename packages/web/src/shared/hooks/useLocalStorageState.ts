import { Dispatch, SetStateAction, useEffect, useState } from 'react';

export default function useLocalStorageState<
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  S extends boolean | number | string | Record<string, any>
>(key: string, initialState?: S | (() => S)): [S, Dispatch<SetStateAction<S>>] {
  const [state, setState] = useState<S>(() => {
    const storageItem = localStorage.getItem(key);
    if (storageItem) {
      return JSON.parse(storageItem);
    } else {
      return typeof initialState === 'function' ? initialState() : initialState;
    }
  });

  useEffect(() => {
    if (state != null) {
      localStorage.setItem(key, JSON.stringify(state));
    } else {
      localStorage.removeItem(key);
    }
  }, [key, state]);

  return [state, setState];
}
