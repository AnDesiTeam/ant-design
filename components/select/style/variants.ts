import type { CSSObject } from '@ant-design/cssinjs';
import type { SelectToken } from './token';
import { unit } from '@ant-design/cssinjs';

// =====================================================
// ==                  Outlined                       ==
// =====================================================
const genBaseOutlinedStyle = (
  token: SelectToken,
  options: {
    borderColor: string;
    hoverBorderHover: string;
    activeBorderColor: string;
    activeShadowColor: string;
  },
): CSSObject => {
  const { componentCls, antCls, controlOutlineWidth } = token;

  return {
    [`&:not(${componentCls}-customize-input) ${componentCls}-selector`]: {
      border: `${unit(token.lineWidth)} ${token.lineType} ${options.borderColor}`,
      background: token.selectorBg,
    },
    [`&:not(${componentCls}-disabled):not(${componentCls}-customize-input):not(${antCls}-pagination-size-changer)`]:
      {
        [`&:hover ${componentCls}-selector`]: {
          borderColor: options.hoverBorderHover,
        },

        [`${componentCls}-focused& ${componentCls}-selector`]: {
          borderColor: options.activeBorderColor,
          boxShadow: `0 0 0 ${unit(controlOutlineWidth)} ${options.activeShadowColor}`,
          outline: 0,
        },
      },
  };
};

const genOutlinedStatusStyle = (
  token: SelectToken,
  options: {
    status: string;
    borderColor: string;
    hoverBorderHover: string;
    activeBorderColor: string;
    activeShadowColor: string;
  },
): CSSObject => ({
  [`&${token.componentCls}-status-${options.status}`]: {
    ...genBaseOutlinedStyle(token, options),
  },
});

const genOutlinedStyle = (token: SelectToken): CSSObject => ({
  '&-outlined': {
    ...genBaseOutlinedStyle(token, {
      borderColor: token.colorBorder,
      hoverBorderHover: token.colorPrimaryHover,
      activeBorderColor: token.colorPrimary,
      activeShadowColor: token.controlOutline,
    }),

    ...genOutlinedStatusStyle(token, {
      status: 'error',
      borderColor: token.colorError,
      hoverBorderHover: token.colorErrorHover,
      activeBorderColor: token.colorError,
      activeShadowColor: token.colorErrorOutline,
    }),

    ...genOutlinedStatusStyle(token, {
      status: 'warning',
      borderColor: token.colorWarning,
      hoverBorderHover: token.colorWarningHover,
      activeBorderColor: token.colorWarning,
      activeShadowColor: token.colorWarningOutline,
    }),

    [`&${token.componentCls}-disabled`]: {
      [`&:not(${token.componentCls}-customize-input) ${token.componentCls}-selector`]: {
        background: token.colorBgContainerDisabled,
        color: token.colorTextDisabled,
      },
    },
  },
});

// =====================================================
// ==                   Filled                        ==
// =====================================================
const genBaseFilledStyle = (
  token: SelectToken,
  options: {
    bg: string;
    hoverBg: string;
    activeBorderColor: string;
  },
): CSSObject => {
  const { componentCls, antCls } = token;

  return {
    [`&:not(${componentCls}-customize-input) ${componentCls}-selector`]: {
      background: options.bg,
      border: `${unit(token.lineWidth)} ${token.lineType} transparent`,
    },
    [`&:not(${componentCls}-disabled):not(${componentCls}-customize-input):not(${antCls}-pagination-size-changer)`]:
      {
        [`&:hover ${componentCls}-selector`]: {
          background: options.hoverBg,
        },

        [`${componentCls}-focused& ${componentCls}-selector`]: {
          background: token.selectorBg,
          borderColor: options.activeBorderColor,
          outline: 0,
        },
      },
  };
};

const genFilledStatusStyle = (
  token: SelectToken,
  options: {
    status: string;
    bg: string;
    hoverBg: string;
    activeBorderColor: string;
  },
): CSSObject => ({
  [`&${token.componentCls}-status-${options.status}`]: {
    ...genBaseFilledStyle(token, options),
  },
});

const genFilledStyle = (token: SelectToken): CSSObject => ({
  '&-filled': {
    ...genBaseFilledStyle(token, {
      bg: token.colorFillTertiary,
      hoverBg: token.colorFillSecondary,
      activeBorderColor: token.colorPrimary,
    }),

    ...genFilledStatusStyle(token, {
      status: 'error',
      bg: token.colorErrorBg,
      hoverBg: token.colorErrorBgHover,
      activeBorderColor: token.colorError,
    }),

    ...genFilledStatusStyle(token, {
      status: 'warning',
      bg: token.colorWarningBg,
      hoverBg: token.colorWarningBgHover,
      activeBorderColor: token.colorWarning,
    }),

    [`&${token.componentCls}-disabled`]: {
      [`&:not(${token.componentCls}-customize-input) ${token.componentCls}-selector`]: {
        borderColor: token.colorBorder,
        background: token.colorBgContainerDisabled,
        color: token.colorTextDisabled,
      },
    },
  },
});

// =====================================================
// ==                 Borderless                      ==
// =====================================================
const genBorderlessStyle = (token: SelectToken): CSSObject => ({
  '&-borderless': {
    [`${token.componentCls}-selector`]: {
      background: 'transparent',
      borderColor: 'transparent',
    },

    [`&${token.componentCls}-disabled`]: {
      [`&:not(${token.componentCls}-customize-input) ${token.componentCls}-selector`]: {
        color: token.colorTextDisabled,
      },
    },
  },
});

const genVariantsStyle = (token: SelectToken): CSSObject => ({
  [token.componentCls]: {
    ...genOutlinedStyle(token),
    ...genFilledStyle(token),
    ...genBorderlessStyle(token),
  },
});

export default genVariantsStyle;
