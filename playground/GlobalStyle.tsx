import React from 'react';
import { theme } from 'antd';
// eslint-disable-next-line import/no-extraneous-dependencies
import { css, Global } from '@emotion/react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { useLocation } from 'react-router-dom';

const GlobalStyle = () => {
  const { token } = theme.useToken();
  const { pathname } = useLocation();

  return (
    <Global
      key={pathname ?? '__global__'}
      styles={css`
        html, body, #root {
          color: ${token.colorText};
          font-size: ${token.fontSize}px;
          font-family: ${token.fontFamily};
          line-height: ${token.lineHeight};
          background: ${token.colorBgContainer};
        }
      `}
    />
  );
};
export default GlobalStyle;