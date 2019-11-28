import * as React from 'react';
import omit from 'omit.js';
import classNames from 'classnames';
import { ConfigConsumer, ConfigConsumerProps } from '../config-provider';
import Element, { SkeletonElementProps } from './Element';

export interface SkeletonAvatarProps extends Omit<SkeletonElementProps, 'shape'> {
  active?: boolean;
  shape?: 'circle' | 'square';
}

// eslint-disable-next-line react/prefer-stateless-function
class SkeletonAvatar extends React.Component<SkeletonAvatarProps, any> {
  static defaultProps: Partial<SkeletonAvatarProps> = {
    size: 'default',
    shape: 'circle',
  };

  renderSkeletonAvatar = ({ getPrefixCls }: ConfigConsumerProps) => {
    const { prefixCls: customizePrefixCls, className, active } = this.props;
    const prefixCls = getPrefixCls('skeleton', customizePrefixCls);
    const otherProps = omit(this.props, ['prefixCls']);
    const cls = classNames(prefixCls, className, `${prefixCls}-element`, {
      [`${prefixCls}-active`]: active,
    });
    return (
      <div className={cls}>
        <Element prefixCls={`${prefixCls}-avatar`} {...otherProps} />
      </div>
    );
  };

  render() {
    return <ConfigConsumer>{this.renderSkeletonAvatar}</ConfigConsumer>;
  }
}

export default SkeletonAvatar;
