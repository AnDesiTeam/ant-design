import * as React from 'react';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';

export interface TimeLineItemProps {
  prefixCls?: string;
  className?: string;
  color?: string;
  stamp?: string;
  dot?: React.ReactNode;
  pending?: boolean;
  position?: string;
  style?: React.CSSProperties;
}

const TimelineItem: React.SFC<TimeLineItemProps> = props => (
  <ConfigConsumer>
    {({ getPrefixCls }: ConfigConsumerProps) => {
      const {
        prefixCls: customizePrefixCls,
        className,
        color = '',
        stamp = '',
        children,
        pending,
        position,
        dot,
        ...restProps
      } = props;

      const prefixCls = getPrefixCls('timeline', customizePrefixCls);
      const itemClassName = classNames(
        {
          [`${prefixCls}-item`]: true,
          [`${prefixCls}-item-pending`]: pending,
        },
        className,
      );

      const dotClassName = classNames({
        [`${prefixCls}-item-head`]: true,
        [`${prefixCls}-item-head-custom`]: dot,
        [`${prefixCls}-item-head-${color}`]: true,
      });

      const stampShow =
        stamp.length == 10 ? <div className={`${prefixCls}-item-stamp`}>{stamp}</div> : null;

      return (
        <li {...restProps} className={itemClassName}>
          {stampShow}
          <div className={`${prefixCls}-item-tail`} />
          <div
            className={dotClassName}
            style={{ borderColor: /blue|red|green/.test(color) ? undefined : color }}
          >
            {dot}
          </div>
          <div className={`${prefixCls}-item-content`}>{children}</div>
        </li>
      );
    }}
  </ConfigConsumer>
);

TimelineItem.defaultProps = {
  color: 'blue',
  stamp: '',
  pending: false,
  position: '',
};

export default TimelineItem;
