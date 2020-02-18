import * as React from 'react';
import { cnb } from 'cnbuilder';

export interface SkeletonElementProps {
  prefixCls?: string;
  className?: string;
  style?: object;
  size?: 'large' | 'small' | 'default' | number;
  shape?: 'circle' | 'square' | 'round';
  active?: boolean;
}

// eslint-disable-next-line react/prefer-stateless-function
class Element extends React.Component<SkeletonElementProps, any> {
  render() {
    const { prefixCls, className, style, size, shape } = this.props;

    const sizeCls = cnb({
      [`${prefixCls}-lg`]: size === 'large',
      [`${prefixCls}-sm`]: size === 'small',
    });

    const shapeCls = cnb({
      [`${prefixCls}-circle`]: shape === 'circle',
      [`${prefixCls}-square`]: shape === 'square',
      [`${prefixCls}-round`]: shape === 'round',
    });

    const sizeStyle: React.CSSProperties =
      typeof size === 'number'
        ? {
            width: size,
            height: size,
            lineHeight: `${size}px`,
          }
        : {};
    return (
      <span
        className={cnb(prefixCls, className, sizeCls, shapeCls)}
        style={{ ...sizeStyle, ...style }}
      />
    );
  }
}

export default Element;
