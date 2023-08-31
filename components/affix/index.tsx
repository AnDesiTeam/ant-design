'use client';

import React from 'react';

import classNames from 'classnames';
import ResizeObserver from 'rc-resize-observer';
import omit from 'rc-util/lib/omit';
import throttleByAnimationFrame from '../_util/throttleByAnimationFrame';
import type { ConfigConsumerProps } from '../config-provider';
import { ConfigContext } from '../config-provider';
import useStyle from './style';
import { getFixedBottom, getFixedTop, getTargetRect } from './utils';

const TRIGGER_EVENTS = [
  'resize',
  'scroll',
  'touchstart',
  'touchmove',
  'touchend',
  'pageshow',
  'load',
] as const;

function getDefaultTarget() {
  return typeof window !== 'undefined' ? window : null;
}

// Affix
export interface AffixProps {
  /** Triggered when the specified offset is reached from the top of the window */
  offsetTop?: number;
  /** Triggered when the specified offset is reached from the bottom of the window */
  offsetBottom?: number;
  style?: React.CSSProperties;
  /** Callback function triggered when fixed state changes */
  onChange?: (affixed?: boolean) => void;
  /** Set the element that Affix needs to listen to its scroll event, the value is a function that returns the corresponding DOM element */
  target?: () => Window | HTMLElement | null;
  prefixCls?: string;
  className?: string;
  rootClassName?: string;
  children: React.ReactNode;
}

interface InternalAffixProps extends AffixProps {
  affixPrefixCls: string;
}

enum AffixStatus {
  None,
  Prepare,
}

export interface AffixState {
  affixStyle?: React.CSSProperties;
  placeholderStyle?: React.CSSProperties;
  status: AffixStatus;
  lastAffix: boolean;
  prevTarget: Window | HTMLElement | null;
}

interface AffixRef {
  updatePosition: ReturnType<typeof throttleByAnimationFrame>;
}

const InternalAffix = React.forwardRef<AffixRef, InternalAffixProps>((props, ref) => {
  const [affixStyle, setAffixStyle] = React.useState<React.CSSProperties>();
  const [placeholderStyle, setPlaceholderStyle] = React.useState<React.CSSProperties>();

  const status = React.useRef(AffixStatus.None);
  const lastAffix = React.useRef(false);
  const prevTarget = React.useRef<Window | HTMLElement | null>(null);
  const prevListener = React.useRef<() => void>();

  const placeholderNodeRef = React.useRef<HTMLDivElement>(null);
  const fixedNodeRef = React.useRef<HTMLDivElement>(null);
  const timer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const { getTargetContainer } = React.useContext<ConfigConsumerProps>(ConfigContext);
  const targetFunc = props.target ?? getTargetContainer ?? getDefaultTarget;

  const offsetTop =
    props.offsetBottom === undefined && props.offsetTop === undefined ? 0 : props.offsetTop;
  const { offsetBottom } = props;

  // =================== Measure ===================
  const measure = () => {
    if (
      status.current !== AffixStatus.Prepare ||
      !fixedNodeRef.current ||
      !placeholderNodeRef.current ||
      !targetFunc
    ) {
      return;
    }

    const targetNode = targetFunc();
    if (targetNode) {
      const newState: Partial<AffixState> = {
        status: AffixStatus.None,
      };
      const placeholderRect = getTargetRect(placeholderNodeRef.current);

      if (
        placeholderRect.top === 0 &&
        placeholderRect.left === 0 &&
        placeholderRect.width === 0 &&
        placeholderRect.height === 0
      ) {
        return;
      }

      const targetRect = getTargetRect(targetNode);
      const fixedTop = getFixedTop(placeholderRect, targetRect, offsetTop);
      const fixedBottom = getFixedBottom(placeholderRect, targetRect, offsetBottom);

      if (fixedTop !== undefined) {
        newState.affixStyle = {
          position: 'fixed',
          top: fixedTop,
          width: placeholderRect.width,
          height: placeholderRect.height,
        };
        newState.placeholderStyle = {
          width: placeholderRect.width,
          height: placeholderRect.height,
        };
      } else if (fixedBottom !== undefined) {
        newState.affixStyle = {
          position: 'fixed',
          bottom: fixedBottom,
          width: placeholderRect.width,
          height: placeholderRect.height,
        };
        newState.placeholderStyle = {
          width: placeholderRect.width,
          height: placeholderRect.height,
        };
      }

      newState.lastAffix = !!newState.affixStyle;
      if (props.onChange && lastAffix.current !== newState.lastAffix) {
        props.onChange(newState.lastAffix);
      }

      status.current = newState.status!;
      setAffixStyle(newState.affixStyle);
      setPlaceholderStyle(newState.placeholderStyle);
      lastAffix.current = newState.lastAffix;
    }
  };

  const prepareMeasure = () => {
    // event param is used before. Keep compatible ts define here.
    status.current = AffixStatus.Prepare;
    measure();

    // Test if `updatePosition` called
    if (process.env.NODE_ENV === 'test') {
      const { onTestUpdatePosition } = props as any;
      onTestUpdatePosition?.();
    }
  };

  const updatePosition = throttleByAnimationFrame(() => {
    prepareMeasure();
  });

  const lazyUpdatePosition = throttleByAnimationFrame(() => {
    // Check position change before measure to make Safari smooth
    if (targetFunc && affixStyle) {
      const targetNode = targetFunc();
      if (targetNode && placeholderNodeRef.current) {
        const targetRect = getTargetRect(targetNode);
        const placeholderRect = getTargetRect(placeholderNodeRef.current);
        const fixedTop = getFixedTop(placeholderRect, targetRect, offsetTop);
        const fixedBottom = getFixedBottom(placeholderRect, targetRect, offsetBottom);

        if (
          (fixedTop !== undefined && affixStyle.top === fixedTop) ||
          (fixedBottom !== undefined && affixStyle.bottom === fixedBottom)
        ) {
          return;
        }
      }
    }

    // Directly call prepare measure since it's already throttled.
    prepareMeasure();
  });

  const addListeners = () => {
    const target = targetFunc?.();
    TRIGGER_EVENTS.forEach((eventName) => {
      if (prevListener.current) {
        prevTarget.current?.removeEventListener(eventName, prevListener.current);
      }
      target?.addEventListener(eventName, lazyUpdatePosition);
    });
    prevTarget.current = target;
    prevListener.current = lazyUpdatePosition;
  };

  const removeListeners = () => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    const newTarget = targetFunc?.();
    TRIGGER_EVENTS.forEach((eventName) => {
      newTarget?.removeEventListener(eventName, lazyUpdatePosition);
      if (prevListener.current) {
        prevTarget.current?.removeEventListener(eventName, prevListener.current);
      }
    });
    updatePosition.cancel();
    // https://github.com/ant-design/ant-design/issues/22683
    lazyUpdatePosition.cancel();
  };

  React.useImperativeHandle(ref, () => ({ updatePosition }));

  // mount & unmount
  React.useEffect(() => {
    // [Legacy] Wait for parent component ref has its value.
    // We should use target as directly element instead of function which makes element check hard.
    timer.current = setTimeout(addListeners);

    return () => {
      removeListeners();
    };
  }, []);

  React.useEffect(() => {
    addListeners();
  }, [props.target, JSON.stringify(affixStyle)]);

  React.useEffect(() => {
    updatePosition();
  }, [props.target, props.offsetTop, props.offsetBottom]);

  // =================== Render ===================
  const { affixPrefixCls, rootClassName, children } = props;
  const className = classNames(affixStyle && rootClassName, {
    [affixPrefixCls]: !!affixStyle,
  });

  let _props = omit(props, [
    'prefixCls',
    'offsetTop',
    'offsetBottom',
    'target',
    'onChange',
    'affixPrefixCls',
    'rootClassName',
  ]);
  // Omit this since `onTestUpdatePosition` only works on test.
  if (process.env.NODE_ENV === 'test') {
    _props = omit(_props as typeof _props & { onTestUpdatePosition: any }, [
      'onTestUpdatePosition',
    ]);
  }

  return (
    <ResizeObserver onResize={updatePosition}>
      <div {..._props} ref={placeholderNodeRef}>
        {affixStyle && <div style={placeholderStyle} aria-hidden="true" />}
        <div className={className} ref={fixedNodeRef} style={affixStyle}>
          <ResizeObserver onResize={updatePosition}>{children}</ResizeObserver>
        </div>
      </div>
    </ResizeObserver>
  );
});

const Affix = React.forwardRef<AffixRef, AffixProps>((props, ref) => {
  const { prefixCls: customizePrefixCls, rootClassName } = props;
  const { getPrefixCls } = React.useContext<ConfigConsumerProps>(ConfigContext);
  const affixPrefixCls = getPrefixCls('affix', customizePrefixCls);

  const [wrapSSR, hashId] = useStyle(affixPrefixCls);

  const AffixProps: InternalAffixProps = {
    ...props,
    affixPrefixCls,
    rootClassName: classNames(rootClassName, hashId),
  };

  return wrapSSR(<InternalAffix {...AffixProps} ref={ref} />);
});

if (process.env.NODE_ENV !== 'production') {
  Affix.displayName = 'Affix';
}

export default Affix;
