import useMergedState from 'rc-util/lib/hooks/useMergedState';
import { useLayoutEffect, useMemo } from 'react';
import type { TourProps } from './interface';

interface Props {
  defaultType?: string;
  steps?: TourProps['steps'];
  current?: number;
  defaultCurrent?: number;
}

/**
 * returns the merged type of a step or the default type.
 */
const useMergedType = ({ defaultType, steps = [], current, defaultCurrent }: Props) => {
  const [innerCurrent, setInnerCurrent] = useMergedState<number | undefined>(defaultCurrent, {
    value: current,
  });

  useLayoutEffect(() => {
    if (current === undefined) return;
    setInnerCurrent(current);
  }, [current]);

  const currentMergedType = useMemo(() => {
    if (typeof innerCurrent !== 'number') {
      return defaultType;
    }

    return steps[innerCurrent]?.type || defaultType;
  }, [defaultType, steps, innerCurrent]);

  return { currentMergedType, setInnerCurrent };
};

export default useMergedType;
