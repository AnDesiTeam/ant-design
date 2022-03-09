// deps-lint-skip-all
import type { CSSInterpolation } from '@ant-design/cssinjs';
import { useStyleRegister, useToken } from '../../_util/theme';
import type { DerivativeToken } from '../../_util/theme';
import { getTitleStyles, getResetStyles } from './mixins';

const genTypographyStyle = ({
  prefixCls,
  token,
}: {
  prefixCls: string;
  token: DerivativeToken;
}): CSSInterpolation => {
  const typographyTitleMarginTop = '1.2em';

  return {
    [`.${prefixCls}`]: {
      color: token.textColor,
      overflowWrap: 'break-word',
      '&&-secondary': {
        color: token.textColorSecondary,
      },

      '&&-success': {
        color: token.successColor,
      },

      '&&-warning': {
        color: token.warningColor,
      },

      '&&-danger': {
        color: token.errorColor,
        'a&:active, a&:focus, a&:hover': {
          color: token.errorColors[4],
        },
      },

      '&&-disabled': {
        color: token.disabledColor,
        cursor: 'not-allowed',
        userSelect: 'none',
      },

      [`
        div,
        p
      `]: {
        marginBottom: '1em',
      },

      ...getTitleStyles(token),

      [`
      & + h1&,
      & + h2&,
      & + h3&,
      & + h4&,
      & + h5&
      `]: {
        marginTop: typographyTitleMarginTop,
      },

      [`
      div,
      ul,
      li,
      p,
      h1,
      h2,
      h3,
      h4,
      h5`]: {
        [`
        + h1,
        + h2,
        + h3,
        + h4,
        + h5
        `]: {
          marginTop: typographyTitleMarginTop,
        },
      },

      [`
      a&-ellipsis,
      span&-ellipsis
      `]: {
        display: 'inline-block',
        maxWidth: '100%',
      },

      ...getResetStyles(),
    },
  };
};

// ============================== Export ==============================
export default function useStyle(prefixCls: string) {
  const [theme, token, hashId] = useToken();

  return [
    useStyleRegister({ theme, token, hashId, path: [prefixCls] }, () => [
      genTypographyStyle({ prefixCls, token }),
    ]),
    hashId,
  ];
}
