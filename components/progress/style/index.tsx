// deps-lint-skip-all
import type { CSSObject } from '@ant-design/cssinjs';
import { Keyframes } from '@ant-design/cssinjs';
import type { FullToken, GenerateStyle } from '../../_util/theme';
import { genComponentStyleHook, mergeToken, resetComponent } from '../../_util/theme';

export interface ComponentToken {}

interface ProgressToken extends FullToken<'Progress'> {
  progressLineRadius: number;
  progressInfoTextColor: string;
  progressRemainingColor: string;
  progressDefaultColor: string;
  progressStepMinWidth: number;
  progressStepMarginInlineEnd: number;
}

const antProgressActive = new Keyframes('antProgressActive', {
  '0%': {
    transform: 'translateX(-100%) scaleX(0)',
    opacity: 0.1,
  },
  '20%': {
    transform: 'translateX(-100%) scaleX(0)',
    opacity: 0.5,
  },
  to: {
    transform: 'translateX(0) scaleX(1)',
    opacity: 0,
  },
});

const genBaseStyle: GenerateStyle<ProgressToken> = (token: ProgressToken) => {
  const { componentCls: progressCls, iconCls: iconPrefixCls } = token;

  return {
    [progressCls]: {
      ...resetComponent(token),

      display: 'inline-block',

      '&-rtl': {
        direction: 'rtl',
      },

      '&-line': {
        position: 'relative',
        width: '100%',
        fontSize: token.fontSizeBase,
        marginInlineEnd: token.marginXS,
        marginBottom: token.marginXS,
      },

      [`${progressCls}-outer`]: {
        display: 'inline-block',
        width: '100%',
      },

      [`&${progressCls}-show-info`]: {
        [`${progressCls}-outer`]: {
          marginInlineEnd: `calc(-2em - ${token.marginXS}px)`,
          paddingInlineEnd: `calc(2em + ${token.paddingXS}px)`,
        },
      },

      [`${progressCls}-inner`]: {
        position: 'relative',
        display: 'inline-block',
        width: '100%',
        overflow: 'hidden',
        verticalAlign: 'middle',
        backgroundColor: token.progressRemainingColor,
        borderRadius: token.progressLineRadius,
      },

      [`${progressCls}-inner:not(${progressCls}-circle-gradient)`]: {
        [`${progressCls}-circle-path`]: {
          stroke: token.colorInfo,
        },
      },

      [`&${progressCls}-success-bg, ${progressCls}-bg`]: {
        position: 'relative',
        backgroundColor: token.colorInfo,
        borderRadius: token.progressLineRadius,
        transition: `all ${token.motionDurationSlow} ${token.motionEaseInOutCirc}`,
      },

      [`${progressCls}-success-bg`]: {
        position: 'absolute',
        insetBlockStart: 0,
        insetInlineStart: 0,
        backgroundColor: token.colorSuccess,
      },

      [`${progressCls}-text`]: {
        display: 'inline-block',
        width: '2em',
        marginInlineStart: token.marginXS,
        color: token.progressInfoTextColor,
        lineHeight: 1,
        whiteSpace: 'nowrap',
        textAlign: 'start',
        verticalAlign: 'middle',
        wordBreak: 'normal',
        [iconPrefixCls]: {
          fontSize: token.fontSizeBase,
        },
      },

      [`&${progressCls}-status-active`]: {
        [`${progressCls}-bg::before`]: {
          position: 'absolute',
          inset: 0,
          background: token.colorBgComponent,
          borderRadius: token.progressLineRadius,
          opacity: 0,
          animationName: antProgressActive,
          animationDuration: '2.4s', // FIXME: hard code
          animationTimingFunction: token.motionEaseOutQuint,
          animationIterationCount: 'infinite',
          content: '""',
        },
      },

      [`&${progressCls}-status-exception`]: {
        [`${progressCls}-bg`]: {
          backgroundColor: token.colorError,
        },
        [`${progressCls}-text`]: {
          color: token.colorError,
        },
      },

      [`&${progressCls}-status-exception ${progressCls}-inner:not(${progressCls}-circle-gradient)`]:
        {
          [`${progressCls}-circle-path`]: {
            stroke: token.colorError,
          },
        },

      [`&${progressCls}-status-success`]: {
        [`${progressCls}-bg`]: {
          backgroundColor: token.colorSuccess,
        },
        [`${progressCls}-text`]: {
          color: token.colorSuccess,
        },
      },

      [`&${progressCls}-status-success ${progressCls}-inner:not(${progressCls}-circle-gradient)`]: {
        [`${progressCls}-circle-path`]: {
          stroke: token.colorSuccess,
        },
      },
    },
  };
};

const genCircleStyle: GenerateStyle<ProgressToken> = (token: ProgressToken): CSSObject => {
  const { componentCls: progressCls, iconCls: iconPrefixCls } = token;

  return {
    [progressCls]: {
      '&-circle': {
        marginInlineEnd: token.marginXS,
        marginBottom: token.marginXS,
      },

      [`${progressCls}-circle-trail`]: {
        stroke: token.progressRemainingColor,
      },

      [`&${progressCls}-circle ${progressCls}-inner`]: {
        position: 'relative',
        lineHeight: 1,
        backgroundColor: 'transparent',
      },

      [`&${progressCls}-circle ${progressCls}-text`]: {
        position: 'absolute',
        insetBlockStart: '50%',
        insetInlineStart: '50%',
        width: '100%',
        margin: 0,
        padding: 0,
        color: token.colorText,
        lineHeight: 1,
        whiteSpace: 'normal',
        textAlign: 'center',
        transform: `translate(-50%, -50%)`,

        [iconPrefixCls]: {
          fontSize: `${token.fontSize / token.fontSizeSM}em`,
        },
      },

      [`${progressCls}-circle&-status-exception`]: {
        [`${progressCls}-text`]: {
          color: token.colorError,
        },
      },

      [`${progressCls}-circle&-status-success`]: {
        [`${progressCls}-text`]: {
          color: token.colorSuccess,
        },
      },
    },
  };
};

const genStepStyle: GenerateStyle<ProgressToken> = (token: ProgressToken): CSSObject => {
  const { componentCls: progressCls } = token;

  return {
    [progressCls]: {
      [`${progressCls}-steps`]: {
        display: 'inline-block',
        '&-outer': {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
        },
        '&-item': {
          flexShrink: 0,
          minWidth: token.progressStepMinWidth,
          marginInlineEnd: token.progressStepMarginInlineEnd,
          background: token.progressRemainingColor,
          transition: `all ${token.motionDurationSlow}`,

          '&-active': {
            background: token.colorInfo,
          },
        },
      },
    },
  };
};

const genSmallLine: GenerateStyle<ProgressToken> = (token: ProgressToken): CSSObject => {
  const { componentCls: progressCls, iconCls: iconPrefixCls } = token;

  return {
    [progressCls]: {
      [`${progressCls}-small&-line, ${progressCls}-small&-line ${progressCls}-text ${iconPrefixCls}`]:
        {
          fontSize: token.fontSizeSM,
        },
    },
  };
};

export default genComponentStyleHook('Progress', token => {
  const progressStepMarginInlineEnd = token.marginXXS / 2;

  const progressToken = mergeToken<ProgressToken>(token, {
    progressLineRadius: 100, // magic for capsule shape, should be a very large number
    progressInfoTextColor: token.colorText,
    progressDefaultColor: token.colorInfo,
    progressRemainingColor: token.colorBgContainer,
    progressStepMarginInlineEnd,
    progressStepMinWidth: progressStepMarginInlineEnd,
  });
  return [
    genBaseStyle(progressToken),
    genCircleStyle(progressToken),
    genStepStyle(progressToken),
    genSmallLine(progressToken),
  ];
});
