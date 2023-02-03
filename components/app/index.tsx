import classNames from 'classnames';
import type { CSSProperties, ReactNode } from 'react';
import React, { useContext } from 'react';
import React, { useContext } from 'react';
import type { ConfigConsumerProps } from '../config-provider';
import { ConfigContext } from '../config-provider';
import useMessage from '../message/useMessage';
import useModal from '../modal/useModal';
import useNotification from '../notification/useNotification';
import type { useAppProps } from './context';
import AppContext from './context';
import useStyle from './style';

export type AppProps = {
  className?: string;
  rootClassName?: string;
  prefixCls?: string;
  children?: ReactNode;
  style?: CSSProperties;
  message?: Parameters<typeof useMessage>[0];
  notification?: Parameters<typeof useNotification>[0];
};

const useApp = () => React.useContext<useAppProps>(AppContext);

const App: React.FC<AppProps> & { useApp: () => useAppProps } = (props) => {
  const { prefixCls: customizePrefixCls, children, className, rootClassName, style, message, notification } = props;
  const { getPrefixCls } = useContext<ConfigConsumerProps>(ConfigContext);
  const prefixCls = getPrefixCls('app', customizePrefixCls);
  const [wrapSSR, hashId] = useStyle(prefixCls);
  const customClassName = classNames(hashId, prefixCls, className, rootClassName);

  const [messageApi, messageContextHolder] = useMessage(message);
  const [notificationApi, notificationContextHolder] = useNotification(notification);
  const [ModalApi, ModalContextHolder] = useModal();

  const memoizedContextValue = React.useMemo<useAppProps>(
    () => ({
      message: messageApi,
      notification: notificationApi,
      modal: ModalApi,
    }),
    [messageApi, notificationApi, ModalApi],
  );

  return wrapSSR(
    <AppContext.Provider value={memoizedContextValue}>
      <div className={customClassName} style={style}>
        {ModalContextHolder}
        {messageContextHolder}
        {notificationContextHolder}
        {children}
      </div>
    </AppContext.Provider>,
  );
};

if (process.env.NODE_ENV !== 'production') {
  App.displayName = 'App';
}

App.useApp = useApp;

export default App;
