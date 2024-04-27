import { unit } from '@ant-design/cssinjs';
import { transparentize } from 'color2k';

import { onBackground } from '../../_util/colors';
import { resetComponent } from '../../style';
import type { ArrowOffsetToken } from '../../style/placementArrow';
import getArrowStyle, {
  getArrowOffsetToken,
  MAX_VERTICAL_CONTENT_RADIUS,
} from '../../style/placementArrow';
import type { ArrowToken } from '../../style/roundedArrow';
import { getArrowToken } from '../../style/roundedArrow';
import type { FullToken, GenerateStyle, GetDefaultToken } from '../../theme/internal';
import { genStyleHooks, mergeToken } from '../../theme/internal';

export interface ComponentToken extends ArrowOffsetToken, ArrowToken {
  /**
   * @desc 弹层 z-index
   * @descEN Tour popup z-index
   */
  zIndexPopup: number;
  /**
   * @desc 关闭按钮尺寸
   * @descEN Close button size
   */
  closeBtnSize: number;
  /**
   * @desc Primary 模式上一步按钮背景色
   * @descEN Background color of previous button in primary type
   */
  primaryPrevBtnBg: string;
  /**
   * @desc Primary 模式下一步按钮悬浮背景色
   * @descEN Hover background color of next button in primary type
   */
  primaryNextBtnHoverBg: string;
  /** @internal */
  closeBtnHoverBg: string;
}

interface TourToken extends FullToken<'Tour'> {
  tourZIndexPopup: number;
  indicatorWidth: number;
  indicatorHeight: number;
  tourBorderRadius: number;
}

// =============================== Base ===============================
const genBaseStyle: GenerateStyle<TourToken> = (token) => {
  const {
    componentCls,
    lineHeight,
    padding,
    paddingXS,
    borderRadius,
    borderRadiusXS,
    colorPrimary,
    colorText,
    colorFill,
    indicatorHeight,
    indicatorWidth,
    boxShadowTertiary,
    tourZIndexPopup,
    fontSize,
    colorBgElevated,
    fontWeightStrong,
    marginXS,
    colorTextLightSolid,
    tourBorderRadius,
    colorWhite,
    primaryNextBtnHoverBg,
    closeBtnSize,
    motionDurationSlow,
    antCls,
    primaryPrevBtnBg,
  } = token;

  return [
    {
      [componentCls]: {
        ...resetComponent(token),

        color: colorText,
        position: 'absolute',
        zIndex: tourZIndexPopup,
        display: 'block',
        visibility: 'visible',
        fontSize,
        lineHeight,
        width: 520,
        '--antd-arrow-background-color': colorBgElevated,

        '&-pure': {
          maxWidth: '100%',
          position: 'relative',
        },

        [`&${componentCls}-hidden`]: {
          display: 'none',
        },

        // ============================= panel content ============================
        [`${componentCls}-content`]: {
          position: 'relative',
        },
        [`${componentCls}-inner`]: {
          textAlign: 'start',
          textDecoration: 'none',
          borderRadius: tourBorderRadius,
          boxShadow: boxShadowTertiary,
          position: 'relative',
          backgroundColor: colorBgElevated,
          border: 'none',
          backgroundClip: 'padding-box',

          [`${componentCls}-close`]: {
            position: 'absolute',
            top: padding,
            insetInlineEnd: padding,
            color: token.colorIcon,
            outline: 'none',
            width: closeBtnSize,
            height: closeBtnSize,
            borderRadius: token.borderRadiusSM,
            transition: `background-color ${token.motionDurationMid}, color ${token.motionDurationMid}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',

            '&:hover': {
              color: token.colorIconHover,
              backgroundColor: token.closeBtnHoverBg,
            },
          },

          [`${componentCls}-cover`]: {
            textAlign: 'center',
            padding: `${unit(token.calc(padding).add(closeBtnSize).add(paddingXS).equal())} ${unit(
              padding,
            )} 0`,
            img: {
              width: '100%',
            },
          },
          [`${componentCls}-header`]: {
            padding: `${unit(padding)} ${unit(padding)} ${unit(paddingXS)}`,

            [`${componentCls}-title`]: {
              lineHeight,
              fontSize,
              fontWeight: fontWeightStrong,
            },
          },

          [`${componentCls}-description`]: {
            padding: `0 ${unit(padding)}`,
            lineHeight,
            wordWrap: 'break-word',
          },

          [`${componentCls}-footer`]: {
            padding: `${unit(paddingXS)} ${unit(padding)} ${unit(padding)}`,
            textAlign: 'end',
            borderRadius: `0 0 ${unit(borderRadiusXS)} ${unit(borderRadiusXS)}`,
            display: 'flex',
            [`${componentCls}-indicators`]: {
              display: 'inline-block',

              [`${componentCls}-indicator`]: {
                width: indicatorWidth,
                height: indicatorHeight,
                display: 'inline-block',
                borderRadius: '50%',
                background: colorFill,
                '&:not(:last-child)': {
                  marginInlineEnd: indicatorHeight,
                },
                '&-active': {
                  background: colorPrimary,
                },
              },
            },
            [`${componentCls}-buttons`]: {
              marginInlineStart: 'auto',
              [`${antCls}-btn`]: {
                marginInlineStart: marginXS,
              },
            },
          },
        },

        // =============================  primary type  ===========================
        // `$` for panel, `&$` for pure panel
        [`${componentCls}-primary, &${componentCls}-primary`]: {
          '--antd-arrow-background-color': colorPrimary,

          [`${componentCls}-inner`]: {
            color: colorTextLightSolid,
            textAlign: 'start',
            textDecoration: 'none',
            backgroundColor: colorPrimary,
            borderRadius,
            boxShadow: boxShadowTertiary,

            [`${componentCls}-close`]: {
              color: colorTextLightSolid,
            },

            [`${componentCls}-indicators`]: {
              [`${componentCls}-indicator`]: {
                background: primaryPrevBtnBg,
                '&-active': {
                  background: colorTextLightSolid,
                },
              },
            },

            [`${componentCls}-prev-btn`]: {
              color: colorTextLightSolid,
              borderColor: primaryPrevBtnBg,
              backgroundColor: colorPrimary,

              '&:hover': {
                backgroundColor: primaryPrevBtnBg,
                borderColor: 'transparent',
              },
            },

            [`${componentCls}-next-btn`]: {
              color: colorPrimary,
              borderColor: 'transparent',
              background: colorWhite,

              '&:hover': {
                background: primaryNextBtnHoverBg,
              },
            },
          },
        },
      },

      // ============================= mask ===========================
      [`${componentCls}-mask`]: {
        [`${componentCls}-placeholder-animated`]: {
          transition: `all ${motionDurationSlow}`,
        },
      },

      // =========== Limit left and right placement radius ==============
      [[
        '&-placement-left',
        '&-placement-leftTop',
        '&-placement-leftBottom',
        '&-placement-right',
        '&-placement-rightTop',
        '&-placement-rightBottom',
      ].join(',')]: {
        [`${componentCls}-inner`]: {
          borderRadius: token.min(tourBorderRadius, MAX_VERTICAL_CONTENT_RADIUS),
        },
      },
    },

    // ============================= Arrow ===========================
    getArrowStyle<TourToken>(token, 'var(--antd-arrow-background-color)'),
  ];
};

// ============================== Export ==============================
export const prepareComponentToken: GetDefaultToken<'Tour'> = (token) => ({
  zIndexPopup: token.zIndexPopupBase + 70,
  closeBtnSize: token.fontSize * token.lineHeight,
  primaryPrevBtnBg: transparentize(token.colorTextLightSolid, 0.15),
  closeBtnHoverBg: token.wireframe ? 'transparent' : token.colorFillContent,
  primaryNextBtnHoverBg: onBackground(token.colorBgTextHover, token.colorWhite),
  ...getArrowOffsetToken({
    contentRadius: token.borderRadiusLG,
    limitVerticalRadius: true,
  }),
  ...getArrowToken(token),
});

export default genStyleHooks(
  'Tour',
  (token) => {
    const { borderRadiusLG } = token;
    const TourToken = mergeToken<TourToken>(token, {
      indicatorWidth: 6,
      indicatorHeight: 6,
      tourBorderRadius: borderRadiusLG,
    });
    return [genBaseStyle(TourToken)];
  },
  prepareComponentToken,
);
