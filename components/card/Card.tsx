import * as React from 'react';
import classNames from 'classnames';
import type { Tab } from 'rc-tabs/lib/interface';
import omit from 'rc-util/lib/omit';

import { ConfigContext } from '../config-provider';
import useSize from '../config-provider/hooks/useSize';
import Skeleton from '../skeleton';
import type { TabsProps } from '../tabs';
import Tabs from '../tabs';
import Grid from './Grid';
import useStyle from './style';

export type CardType = 'inner';
export type CardSize = 'default' | 'small';

export interface CardTabListType extends Omit<Tab, 'label'> {
  key: string;
  /** @deprecated Please use `label` instead */
  tab?: React.ReactNode;
  label?: React.ReactNode;
}

export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  prefixCls?: string;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  bordered?: boolean;
  headStyle?: React.CSSProperties;
  bodyStyle?: React.CSSProperties;
  style?: React.CSSProperties;
  loading?: boolean;
  hoverable?: boolean;
  children?: React.ReactNode;
  id?: string;
  className?: string;
  rootClassName?: string;
  size?: CardSize;
  type?: CardType;
  cover?: React.ReactNode;
  actions?: React.ReactNode[];
  tabList?: CardTabListType[];
  tabBarExtraContent?: React.ReactNode;
  onTabChange?: (key: string) => void;
  activeTabKey?: string;
  defaultActiveTabKey?: string;
  tabProps?: TabsProps;
  classNames?: {
    head?: string;
    body?: string;
    extra?: string;
    title?: string;
    tabs?: string;
    actions?: string;
    cover?: string;
    headWrapper?: string;
  };
  styles?: {
    head?: React.CSSProperties;
    body?: React.CSSProperties;
    extra?: React.CSSProperties;
    title?: React.CSSProperties;
    tabs?: React.CSSProperties;
    actions?: React.CSSProperties;
    cover?: React.CSSProperties;
    headWrapper?: React.CSSProperties;
  };
}

type CardClassNamesModule = keyof Exclude<CardProps['classNames'], undefined>;
type CardStylesModule = keyof Exclude<CardProps['styles'], undefined>;

const ActionNode: React.FC<{
  actionClasses: string;
  actions: React.ReactNode[];
  actionStyle: React.CSSProperties;
}> = (props) => {
  const { actionClasses, actions = [], actionStyle } = props;
  return (
    <ul className={actionClasses} style={actionStyle}>
      {actions.map<React.ReactNode>((action, index) => {
        // Move this out since eslint not allow index key
        // And eslint-disable makes conflict with rollup
        // ref https://github.com/ant-design/ant-design/issues/46022
        const key = `action-${index}`;
        return (
          <li style={{ width: `${100 / actions.length}%` }} key={key}>
            <span>{action}</span>
          </li>
        );
      })}
    </ul>
  );
};

const Card = React.forwardRef<HTMLDivElement, CardProps>((props, ref) => {
  const {
    prefixCls: customizePrefixCls,
    className,
    rootClassName,
    style,
    extra,
    headStyle = {},
    bodyStyle = {},
    title,
    loading,
    bordered = true,
    size: customizeSize,
    type,
    cover,
    actions,
    tabList,
    children,
    activeTabKey,
    defaultActiveTabKey,
    tabBarExtraContent,
    hoverable,
    tabProps = {},
    classNames: customClassNames,
    styles: customStyles,
    ...others
  } = props;

  const { getPrefixCls, direction, card } = React.useContext(ConfigContext);

  const onTabChange = (key: string) => {
    props.onTabChange?.(key);
  };

  const moduleClass = (moduleName: CardClassNamesModule) =>
    classNames(card?.classNames?.[moduleName], customClassNames?.[moduleName]);

  const moduleStyle = (moduleName: CardStylesModule) => ({
    ...card?.styles?.[moduleName],
    ...customStyles?.[moduleName],
  });

  const isContainGrid = React.useMemo<boolean>(() => {
    let containGrid = false;
    React.Children.forEach(children, (element: JSX.Element) => {
      if (element && element.type && element.type === Grid) {
        containGrid = true;
      }
    });
    return containGrid;
  }, [children]);

  const prefixCls = getPrefixCls('card', customizePrefixCls);
  const [wrapCSSVar, hashId] = useStyle(prefixCls);

  const loadingBlock = (
    <Skeleton loading active paragraph={{ rows: 4 }} title={false}>
      {children}
    </Skeleton>
  );

  const hasActiveTabKey = activeTabKey !== undefined;
  const extraProps = {
    ...tabProps,
    [hasActiveTabKey ? 'activeKey' : 'defaultActiveKey']: hasActiveTabKey
      ? activeTabKey
      : defaultActiveTabKey,
    tabBarExtraContent,
  };

  let head: React.ReactNode;
  const mergedSize = useSize(customizeSize);
  const tabSize = !mergedSize || mergedSize === 'default' ? 'large' : mergedSize;
  const tabsClasses = classNames(`${prefixCls}-head-tabs`, moduleClass('tabs'));
  const tabs = tabList ? (
    <Tabs
      size={tabSize}
      {...extraProps}
      className={tabsClasses}
      style={moduleStyle('tabs')}
      onChange={onTabChange}
      items={tabList.map(({ tab, ...item }) => ({ label: tab, ...item }))}
    />
  ) : null;
  if (title || extra || tabs) {
    const headClasses = classNames(`${prefixCls}-head`, moduleClass('head'));
    const titleClasses = classNames(`${prefixCls}-head-title`, moduleClass('title'));
    const extraClasses = classNames(`${prefixCls}-extra`, moduleClass('extra'));
    const headWrapperClasses = classNames(`${prefixCls}-head-wrapper`, moduleClass('headWrapper'));
    const mergedHeadStyle: React.CSSProperties = {
      ...moduleStyle('head'),
      ...headStyle,
    };
    head = (
      <div className={headClasses} style={mergedHeadStyle}>
        <div className={headWrapperClasses} style={moduleStyle('headWrapper')}>
          {title && (
            <div className={titleClasses} style={moduleStyle('title')}>
              {title}
            </div>
          )}
          {extra && (
            <div className={extraClasses} style={moduleStyle('extra')}>
              {extra}
            </div>
          )}
        </div>
        {tabs}
      </div>
    );
  }
  const coverClasses = classNames(`${prefixCls}-cover`, moduleClass('cover'));
  const coverDom = cover ? (
    <div className={coverClasses} style={moduleStyle('cover')}>
      {cover}
    </div>
  ) : null;
  const bodyClasses = classNames(`${prefixCls}-body`, moduleClass('body'));
  const mergedBodyStyle: React.CSSProperties = {
    ...moduleStyle('body'),
    ...bodyStyle,
  };
  const body = (
    <div className={bodyClasses} style={mergedBodyStyle}>
      {loading ? loadingBlock : children}
    </div>
  );

  const actionClasses = classNames(`${prefixCls}-actions`, moduleClass('actions'));
  const actionDom =
    actions && actions.length ? (
      <ActionNode
        actionClasses={actionClasses}
        actionStyle={moduleStyle('actions')}
        actions={actions}
      />
    ) : null;

  const divProps = omit(others, ['onTabChange']);

  const classString = classNames(
    prefixCls,
    card?.className,
    {
      [`${prefixCls}-loading`]: loading,
      [`${prefixCls}-bordered`]: bordered,
      [`${prefixCls}-hoverable`]: hoverable,
      [`${prefixCls}-contain-grid`]: isContainGrid,
      [`${prefixCls}-contain-tabs`]: tabList && tabList.length,
      [`${prefixCls}-${mergedSize}`]: mergedSize,
      [`${prefixCls}-type-${type}`]: !!type,
      [`${prefixCls}-rtl`]: direction === 'rtl',
    },
    className,
    rootClassName,
    hashId,
  );

  const mergedStyle: React.CSSProperties = { ...card?.style, ...style };

  return wrapCSSVar(
    <div ref={ref} {...divProps} className={classString} style={mergedStyle}>
      {head}
      {coverDom}
      {body}
      {actionDom}
    </div>,
  );
});

export default Card;
