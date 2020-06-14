import * as React from 'react';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import RowContext from './RowContext';
import { tuple } from '../_util/type';
import ResponsiveObserve, {
  Breakpoint,
  ScreenMap,
  responsiveArray,
} from '../_util/responsiveObserve';

const RowAligns = tuple('top', 'middle', 'bottom', 'stretch');
const RowJustify = tuple('start', 'end', 'center', 'space-around', 'space-between');

export type Gutter = number | Partial<Record<Breakpoint, number>>;
export interface RowProps extends React.HTMLAttributes<HTMLDivElement> {
  gutter?: Gutter | [Gutter, Gutter];
  align?: typeof RowAligns[number];
  justify?: typeof RowJustify[number];
  prefixCls?: string;
}

const Row: React.FC<RowProps> = props => {
  const [screens, setScreens] = React.useState<ScreenMap>({
    xs: true,
    sm: true,
    md: true,
    lg: true,
    xl: true,
    xxl: true,
  });

  let token: string;

  React.useEffect(() => {
    token = ResponsiveObserve.subscribe(screen => {
      const { gutter } = props;
      if (
        (!Array.isArray(gutter) && typeof gutter === 'object') ||
        (Array.isArray(gutter) && (typeof gutter[0] === 'object' || typeof gutter[1] === 'object'))
      ) {
        setScreens(screen);
      }
    });
  }, []);

  React.useEffect(() => {
    return () => {
      ResponsiveObserve.unsubscribe(token);
    };
  });

  const getGutter = (): [number, number] => {
    const results: [number, number] = [0, 0];
    const { gutter } = props;
    const normalizedGutter = Array.isArray(gutter) ? gutter : [gutter, 0];
    normalizedGutter.forEach((g, index) => {
      if (typeof g === 'object') {
        for (let i = 0; i < responsiveArray.length; i++) {
          const breakpoint: Breakpoint = responsiveArray[i];
          if (screens[breakpoint] && g[breakpoint] !== undefined) {
            results[index] = g[breakpoint] as number;
            break;
          }
        }
      } else {
        results[index] = g || 0;
      }
    });
    return results;
  };

  const renderRow = ({ getPrefixCls, direction }: ConfigConsumerProps) => {
    const {
      prefixCls: customizePrefixCls,
      justify,
      align,
      className,
      style,
      children,
      ...others
    } = props;
    const prefixCls = getPrefixCls('row', customizePrefixCls);
    const gutter = getGutter();
    const classes = classNames(
      prefixCls,
      {
        [`${prefixCls}-${justify}`]: justify,
        [`${prefixCls}-${align}`]: align,
        [`${prefixCls}-rtl`]: direction === 'rtl',
      },
      className,
    );
    const rowStyle = {
      ...(gutter[0]! > 0
        ? {
            marginLeft: gutter[0]! / -2,
            marginRight: gutter[0]! / -2,
          }
        : {}),
      ...(gutter[1]! > 0
        ? {
            marginTop: gutter[1]! / -2,
            marginBottom: gutter[1]! / 2,
          }
        : {}),
      ...style,
    };
    const otherProps = { ...others };
    delete otherProps.gutter;

    return (
      <RowContext.Provider value={{ gutter }}>
        <div {...otherProps} className={classes} style={rowStyle}>
          {children}
        </div>
      </RowContext.Provider>
    );
  };

  return <ConfigConsumer>{renderRow}</ConfigConsumer>;
};

Row.defaultProps = {
  gutter: 0,
};

export default Row;
