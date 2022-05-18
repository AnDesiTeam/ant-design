import { clearFix } from '../../_util/theme';
import type { GenerateStyle } from '../../_util/theme';
import type { UploadToken } from '.';

const genListStyle: GenerateStyle<UploadToken> = token => {
  const { componentCls, antCls, iconCls, fontSizeBase, lineHeight, lineWidth } = token;
  const itemCls = `${componentCls}-list-item`;
  const actionsCls = `${itemCls}-actions`;
  const actionCls = `${itemCls}-action`;
  const listItemHeightSM = Math.round(fontSizeBase * lineHeight);

  return {
    [`${componentCls}-wrapper`]: {
      [`${componentCls}-list`]: {
        ...clearFix(),
        lineHeight: token.lineHeight,

        [itemCls]: {
          position: 'relative',
          height: token.lineHeight * fontSizeBase,
          marginTop: token.marginXS,
          fontSize: fontSizeBase,
          display: 'flex',
          alignItems: 'center',
          transition: `background-color ${token.motionDurationSlow}`,

          '&:hover': {
            backgroundColor: token.controlItemBgHover,
          },

          [`${itemCls}-name`]: {
            padding: `0 ${token.paddingXS}px`,
            overflow: 'hidden',
            lineHeight,
            whiteSpace: 'nowrap',
            textOverflow: 'ellipsis',
            flex: 'auto',
            transition: `all ${token.motionDurationSlow}`,
          },

          [actionsCls]: {
            [actionCls]: {
              opacity: 0,
            },

            [`${actionCls}${antCls}-btn-sm`]: {
              height: listItemHeightSM,
              border: 0,
              lineHeight: 1,
              // FIXME: should not override small button
              '> span': {
                transform: 'scale(1)',
              },
            },

            [`
              ${actionCls}:focus,
              &.picture ${actionCls}
            `]: {
              opacity: 1,
            },

            [iconCls]: {
              color: token.colorTextSecondary,
              transition: `all ${token.motionDurationSlow}`,
            },

            [`&:hover ${iconCls}`]: {
              color: token.colorText,
            },
          },

          [`${componentCls}-icon ${iconCls}`]: {
            color: token.colorTextSecondary,
            fontSize: fontSizeBase,
          },

          [`${itemCls}-progress`]: {
            position: 'absolute',
            bottom: -token.uploadProgressOffset,
            width: '100%',
            paddingInlineStart: fontSizeBase + token.paddingXS,
            fontSize: fontSizeBase,
            lineHeight: 0,
            pointerEvents: 'none',

            '> div': {
              margin: 0,
            },
          },
        },

        [`${itemCls}:hover ${actionCls}`]: {
          opacity: 1,
          color: token.colorText,
        },

        [`${itemCls}-error`]: {
          color: token.colorError,
          [`${itemCls}-name, ${componentCls}-icon ${iconCls}`]: {
            color: token.colorError,
          },

          [actionsCls]: {
            [`${iconCls}, ${iconCls}:hover`]: {
              color: token.colorError,
            },

            [actionCls]: {
              opacity: 1,
            },
          },
        },

        [`${componentCls}-list-item-container`]: {
          transition: `opacity ${token.motionDurationSlow}, height ${token.motionDurationSlow}`,

          // For smooth removing animation
          '&::before': {
            display: 'table',
            width: 0,
            height: 0,
            content: '""',
          },
        },
      },
    },
  };
};

export default genListStyle;
