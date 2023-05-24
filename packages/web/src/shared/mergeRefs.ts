import { MutableRefObject, Ref, useCallback } from 'react';

type MergableRef<T> =
  | ((instance: T | null) => void)
  | MutableRefObject<T | null>
  | undefined
  | null;

export default function useMergedRef<T>(
  ref1: MergableRef<T>,
  ref2: MergableRef<T>
): Ref<T> {
  return useCallback(
    (value: T | null) => {
      if (typeof ref1 === 'function') ref1(value);
      else if (ref1) ref1.current = value;

      if (typeof ref2 === 'function') ref2(value);
      else if (ref2) ref2.current = value;
    },
    [ref1, ref2]
  );
}
