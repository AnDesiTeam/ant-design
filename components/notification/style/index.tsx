// deps-lint-skip-all
// import '../../style/index.less';
// import './index.less';

import type { CSSObject } from '@ant-design/cssinjs';
import { Keyframes } from '@ant-design/cssinjs';
import { TinyColor } from '@ctrl/tinycolor';
import type { FullToken, GenerateStyle } from '../../_util/theme';
import { genComponentStyleHook, mergeToken, resetComponent } from '../../_util/theme';
import genNotificationPlacementStyle from './placement';

/** Component only token. Which will handle additional calculation of alias token */
export interface ComponentToken {}

export interface NotificationToken extends FullToken<'Notification'> {
  // default.less variables
  zIndexNotification: number;
  notificationBg: string;
  notificationPaddingVertical: number;
  notificationPaddingHorizontal: number;
  // index.less variables
  popoverBackground: string;
  notificationWidth: number;
  notificationPadding: string;
  notificationMarginBottom: number;
  notificationMarginEdge: number;
}

const genNotificationStyle: GenerateStyle<NotificationToken, CSSObject> = token => {
  const {
    iconCls,
    componentCls, // .ant-notification
    colorTextSecondary,
    notificationWidth,
    boxShadow,
    fontSizeLG,
    notificationMarginBottom,
    radiusBase,
    notificationPaddingHorizontal,
    colorSuccess,
    colorInfo,
    colorWarning,
    colorError,
    colorTextHeading,
    notificationBg,
    notificationPadding,
    notificationMarginEdge,
    zIndexNotification,
    motionDurationMid,
    motionEaseInOut,
    fontSizeBase,
    lineHeight,
  } = token;

  const notificationFadeIn = new Keyframes('antNotificationFadeIn', {
    '0%': {
      left: {
        _skip_check_: true,
        value: notificationWidth,
      },
      opacity: 0,
    },

    '100%': {
      left: {
        _skip_check_: true,
        value: 0,
      },
      opacity: 1,
    },
  });

  const notificationFadeOut = new Keyframes('antNotificationFadeOut', {
    '0%': {
      maxHeight: 150,
      marginBottom: notificationMarginBottom,
      opacity: 1,
    },

    '100%': {
      maxHeight: 0,
      marginBottom: 0,
      paddingTop: 0,
      paddingBottom: 0,
      opacity: 0,
    },
  });

  return {
    [componentCls]: {
      ...resetComponent(token),

      position: 'fixed',
      zIndex: zIndexNotification,
      // marginRight: notificationMarginEdge,
      marginInlineEnd: notificationMarginEdge,

      [`${componentCls}-close-icon`]: {
        fontSize: fontSizeBase,
        cursor: 'pointer',
      },

      [`${componentCls}-hook-holder`]: {
        position: 'relative',
      },

      [`${componentCls}-notice`]: {
        position: 'relative',
        width: notificationWidth,
        maxWidth: `calc(100vw - ${notificationMarginEdge * 2}px)`,
        marginBottom: notificationMarginBottom,
        // marginLeft: 'auto',
        marginInlineStart: 'auto',
        padding: notificationPadding,
        overflow: 'hidden',
        lineHeight,
        wordWrap: 'break-word',
        background: notificationBg,
        borderRadius: radiusBase,
        boxShadow,

        [`&-message`]: {
          marginBottom: 8,
          color: colorTextHeading,
          fontSize: fontSizeLG,
          lineHeight: '24px',

          // https://github.com/ant-design/ant-design/issues/5846#issuecomment-296244140
          [`&-single-line-auto-margin`]: {
            display: 'block',
            width: `calc(${notificationWidth}  ${
              notificationPaddingHorizontal * 2
            }  24px  48px  100%)`,
            maxWidth: 4,
            backgroundColor: 'transparent',
            pointerEvents: 'none',

            '&::before': {
              display: 'block',
              content: '""',
            },
          },
        },

        '&-description': {
          fontSize: fontSizeBase,
        },

        [`&-closable ${componentCls}-notice-message`]: {
          paddingInlineEnd: 24,
        },

        [`&-with-icon ${componentCls}-notice-message`]: {
          marginBottom: 4,
          marginInlineStart: 48,
          fontSize: fontSizeLG,
        },

        [`&-with-icon ${componentCls}-notice-description`]: {
          marginInlineStart: 48,
          fontSize: fontSizeBase,
        },

        // Icon & color style in different selector level
        // https://github.com/ant-design/ant-design/issues/16503
        // https://github.com/ant-design/ant-design/issues/15512
        '&-icon': {
          position: 'absolute',
          marginInlineStart: 4,
          fontSize: 24,
          lineHeight: '24px',

          // icon-font
          [`&-success${iconCls}`]: {
            color: colorSuccess,
          },
          [`&-info${iconCls}`]: {
            color: colorInfo,
          },
          [`&-warning${iconCls}`]: {
            color: colorWarning,
          },
          [`&-error${iconCls}`]: {
            color: colorError,
          },
        },

        '&-close': {
          position: 'absolute',
          top: 16,
          insetInlineEnd: 22,
          color: colorTextSecondary,
          outline: 'none',

          '&:hover': {
            // FIXME: hard code in v4, shade(@text-color-secondary, 40%)
            color: new TinyColor(colorTextSecondary).setAlpha(0.4).toRgbString(),
          },
        },

        '&-btn': {
          float: 'inline-end',
          marginTop: 16,
        },
      },

      [`&${componentCls}-top, &${componentCls}-bottom`]: {
        [`${componentCls}-notice`]: {
          // marginRight: 'auto',
          // marginLeft: 'auto',
          marginInline: 'auto auto',
        },
      },

      [`&${componentCls}-topLeft, &${componentCls}-bottomLeft`]: {
        [`${componentCls}-notice`]: {
          // marginRight: 'auto',
          marginInlineEnd: 'auto',
          // marginLeft: 0,
          marginInlineStart: 0,
        },
      },

      // '.notification-fade-effect': {
      //   animationDuration: '0.24s',
      //   animationTimingFunction: motionEaseInOut,
      //   animationFillMode: 'both',
      // },

      //  animation
      [`${componentCls}-fade-enter, ${componentCls}-fade-appear`]: {
        animationDuration: '0.24s',
        animationTimingFunction: motionEaseInOut,
        animationFillMode: 'both',

        opacity: 0,
        animationPlayState: 'paused',
      },

      [`${componentCls}-fade-leave`]: {
        animationTimingFunction: motionEaseInOut,
        animationFillMode: 'both',

        animationDuration: motionDurationMid,
        animationPlayState: 'paused',
      },

      [`${componentCls}-fade-enter${componentCls}-fade-enter-active, ${componentCls}-fade-appear${componentCls}-fade-appear-active`]:
        {
          animationName: notificationFadeIn,
          animationPlayState: 'running',
        },

      [`${componentCls}-fade-leave${componentCls}-fade-leave-active`]: {
        animationName: notificationFadeOut,
        animationPlayState: 'running',
      },

      // placement
      ...genNotificationPlacementStyle(token),

      // RTL
      '&-rtl': {
        direction: 'rtl',
      },
    },
  };
};

// ============================== Export ==============================
export default genComponentStyleHook('Notification', token => {
  const { colorBgComponent, zIndexPopupBase } = token;
  const notificationPaddingVertical = 16;
  const notificationPaddingHorizontal = 24;

  const notificationToken = mergeToken<NotificationToken>(token, {
    // default.less variables
    zIndexNotification: zIndexPopupBase + 50,
    notificationBg: colorBgComponent,
    notificationPaddingVertical,
    notificationPaddingHorizontal,
    // index.less variables
    popoverBackground: colorBgComponent,
    notificationWidth: 384,
    notificationPadding: `${notificationPaddingVertical}px ${notificationPaddingHorizontal}px`,
    notificationMarginBottom: 16,
    notificationMarginEdge: 24,
  });

  return [genNotificationStyle(notificationToken)];
});
