import { useMutateObserver } from '@rc-component/mutate-observer';
import classNames from 'classnames';
import React, { useEffect } from 'react';
import { reRendering } from './utils';
import theme from '../theme';
import useWatermark from './useWatermark';
import useRafDebounce from './useRafDebounce';
import useContent from './useContent';
import WatermarkContext from './context';
import type { WatermarkContextProps } from './context';

export interface WatermarkProps {
  zIndex?: number;
  rotate?: number;
  width?: number;
  height?: number;
  image?: string;
  content?: string | string[];
  font?: {
    color?: string;
    fontSize?: number | string;
    fontWeight?: 'normal' | 'light' | 'weight' | number;
    fontStyle?: 'none' | 'normal' | 'italic' | 'oblique';
    fontFamily?: string;
  };
  style?: React.CSSProperties;
  className?: string;
  rootClassName?: string;
  gap?: [number, number];
  offset?: [number, number];
  children?: React.ReactNode;
}

const Watermark: React.FC<WatermarkProps> = (props) => {
  const {
    /**
     * The antd content layer zIndex is basically below 10
     * https://github.com/ant-design/ant-design/blob/6192403b2ce517c017f9e58a32d58774921c10cd/components/style/themes/default.less#L335
     */
    zIndex = 9,
    rotate = -22,
    width,
    height,
    image,
    content,
    font = {},
    style,
    className,
    rootClassName,
    gap = [100, 100],
    offset,
    children,
  } = props;
  const { token } = theme.useToken();
  const {
    color = token.colorFill,
    fontSize = token.fontSizeLG,
    fontWeight = 'normal',
    fontStyle = 'normal',
    fontFamily = 'sans-serif',
  } = font;

  const [gapX, gapY] = gap;
  const gapXCenter = gapX / 2;
  const gapYCenter = gapY / 2;
  const offsetLeft = offset?.[0] ?? gapXCenter;
  const offsetTop = offset?.[1] ?? gapYCenter;

  const markStyle = React.useMemo(() => {
    const mergedStyle: React.CSSProperties = {
      zIndex,
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      backgroundRepeat: 'repeat',
    };

    /** Calculate the style of the offset */
    let positionLeft = offsetLeft - gapXCenter;
    let positionTop = offsetTop - gapYCenter;
    if (positionLeft > 0) {
      mergedStyle.left = `${positionLeft}px`;
      mergedStyle.width = `calc(100% - ${positionLeft}px)`;
      positionLeft = 0;
    }
    if (positionTop > 0) {
      mergedStyle.top = `${positionTop}px`;
      mergedStyle.height = `calc(100% - ${positionTop}px)`;
      positionTop = 0;
    }
    mergedStyle.backgroundPosition = `${positionLeft}px ${positionTop}px`;

    return mergedStyle;
  }, [zIndex, offsetLeft, gapXCenter, offsetTop, gapYCenter]);

  const [container, setContainer] = React.useState<HTMLDivElement | null>();

  // Used for nest case like Modal, Drawer
  const [subElements, setSubElements] = React.useState(new Set<HTMLElement>());

  // Nest elements should also support watermark
  const targetElements = React.useMemo(() => {
    const list = container ? [container] : [];
    return [...list, ...Array.from(subElements)];
  }, [container, subElements]);

  // ============================ Content =============================
  const [watermarkInfo, setWatermarkInfo] = React.useState<[base64: string, contentWidth: number]>(
    null!,
  );

  // Generate new Watermark content
  const renderWatermark = useContent(
    {
      ...props,
      rotate,
      gap,
    },
    (base64, contentWidth) => {
      setWatermarkInfo([base64, contentWidth]);
    },
  );

  const syncWatermark = useRafDebounce(renderWatermark);

  // ============================= Effect =============================
  // Append watermark to the container
  const [appendWatermark, removeWatermark, isWatermarkEle] = useWatermark(markStyle, gapX);

  useEffect(() => {
    if (watermarkInfo) {
      targetElements.forEach((holder) => {
        appendWatermark(watermarkInfo[0], watermarkInfo[1], holder);
      });
    }
  }, [watermarkInfo, targetElements]);

  // ============================ Observe =============================
  const onMutate = (mutations: MutationRecord[]) => {
    mutations.forEach((mutation) => {
      if (reRendering(mutation, isWatermarkEle)) {
        syncWatermark();
      }
    });
  };

  useMutateObserver(targetElements, onMutate);

  useEffect(syncWatermark, [
    rotate,
    zIndex,
    width,
    height,
    image,
    content,
    color,
    fontSize,
    fontWeight,
    fontStyle,
    fontFamily,
    gapX,
    gapY,
    offsetLeft,
    offsetTop,
  ]);

  // ============================ Context =============================
  const watermarkContext = React.useMemo<WatermarkContextProps>(
    () => ({
      add: (ele) => {
        setSubElements((prev) => {
          if (prev.has(ele)) {
            return prev;
          }

          const clone = new Set(prev);
          clone.add(ele);
          return clone;
        });
      },
      remove: (ele) => {
        removeWatermark(ele);

        setSubElements((prev) => {
          if (!prev.has(ele)) {
            return prev;
          }

          const clone = new Set(prev);
          clone.delete(ele);

          return clone;
        });
      },
    }),
    [],
  );

  // ============================= Render =============================
  return (
    <div
      ref={setContainer}
      className={classNames(className, rootClassName)}
      style={{ position: 'relative', ...style }}
    >
      <WatermarkContext.Provider value={watermarkContext}>{children}</WatermarkContext.Provider>
    </div>
  );
};

if (process.env.NODE_ENV !== 'production') {
  Watermark.displayName = 'Watermark';
}

export default Watermark;
