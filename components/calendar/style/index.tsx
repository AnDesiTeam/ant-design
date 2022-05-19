// deps-lint-skip-all
import type { CSSObject } from '@ant-design/cssinjs';
import type { FullToken } from '../../_util/theme';
import { genComponentStyleHook, mergeToken, resetComponent } from '../../_util/theme';
import type { PickerPanelToken } from '../../date-picker/style';
import { genPanelStyle, initPickerPanelToken } from '../../date-picker/style';
import type { InputToken } from '../../input/style';
import { initInputToken } from '../../input/style';

export interface ComponentToken {}

interface CalendarToken extends InputToken<FullToken<'Calendar'>>, PickerPanelToken {
  calendarCls: string;
  // date-picker token
  calendarFullBg: string;
  calendarFullPanelBg: string;
  calendarItemActiveBg: string;
}

export const genCalendarStyles = (token: CalendarToken): CSSObject => {
  const { calendarCls, componentCls, calendarFullBg, calendarFullPanelBg, calendarItemActiveBg } =
    token;
  return {
    [calendarCls]: {
      ...genPanelStyle(token),
      ...resetComponent(token),
      background: calendarFullBg,
      '&-rtl': {
        direction: 'rtl',
      },
      [`${calendarCls}-header`]: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: `${token.paddingSM}px 0`,

        [`${calendarCls}-year-select`]: {
          // FIXME hardcode in v4
          minWidth: 80,
        },
        [`${calendarCls}-month-select`]: {
          // FIXME hardcode in v4
          minWidth: 70,
          marginInlineStart: token.marginXS,
        },
        [`${calendarCls}-mode-switch`]: {
          marginInlineStart: token.marginXS,
        },
      },
    },
    [`${calendarCls} ${componentCls}-panel`]: {
      background: calendarFullPanelBg,
      border: 0,
      borderTop: `${token.controlLineWidth}px ${token.controlLineType} ${token.colorSplit}`,
      borderRadius: 0,
      [`${componentCls}-month-panel, ${componentCls}-date-panel`]: {
        width: 'auto',
      },
      [`${componentCls}-body`]: {
        padding: `${token.paddingXS}px 0`,
      },
      [`${componentCls}-content`]: {
        width: '100%',
      },
    },
    [`${calendarCls}-mini`]: {
      borderRadius: token.radiusBase,
      [`${calendarCls}-header`]: {
        paddingInlineEnd: token.paddingXS,
        paddingInlineStart: token.paddingXS,
      },
      [`${componentCls}-panel`]: {
        borderRadius: `0 0 ${token.radiusBase}px ${token.radiusBase}px`,
      },
      [`${componentCls}-content`]: {
        // FIXME hardcode in v4
        height: 256,
        th: {
          height: 'auto',
          padding: 0,
          lineHeight: '18px',
        },
      },
      [`${componentCls}-cell::before`]: {
        pointerEvents: 'none',
      },
    },
    [`${calendarCls}${calendarCls}-full`]: {
      [`${componentCls}-panel`]: {
        display: 'block',
        width: '100%',
        textAlign: 'end',
        background: calendarFullBg,
        border: 0,
        [`${componentCls}-body`]: {
          'th, td': {
            padding: 0,
          },
          th: {
            height: 'auto',
            paddingInlineEnd: token.paddingSM,
            // FIXME hardcode in v4
            paddingBottom: 5,
            lineHeight: '18px',
          },
        },
      },
      [`${componentCls}-cell`]: {
        '&::before': {
          display: 'none',
        },
        '&:hover': {
          [`${calendarCls}-date`]: {
            background: token.controlItemBgHover,
          },
        },
        [`${calendarCls}-date-today::before`]: {
          display: 'none',
        },
        // >>> Selected
        '&-in-view:is(&-selected)': {
          [`${calendarCls}-date, ${calendarCls}-date-today`]: {
            background: calendarItemActiveBg,
          },
        },
        '&-selected, &-selected:hover': {
          [`${calendarCls}-date, ${calendarCls}-date-today`]: {
            [`${calendarCls}-date-value`]: {
              color: token.colorPrimary,
            },
          },
        },
      },
      [`${calendarCls}-date`]: {
        display: 'block',
        width: 'auto',
        height: 'auto',
        margin: `0 ${token.marginXS / 2}px`,
        padding: `${token.paddingXS / 2}px ${token.paddingXS}px 0`,
        border: 0,
        // FIXME hardcode in v4
        borderTop: `2px ${token.lineType} ${token.colorSplit}`,
        borderRadius: 0,
        transition: `background ${token.motionDurationSlow}`,
        '&-value': {
          // FIXME hardcode in v4
          lineHeight: '24px',
          transition: `color ${token.motionDurationSlow}`,
        },
        '&-content': {
          position: 'static',
          width: 'auto',
          // FIXME hardcode in v4
          height: 86,
          overflowY: 'auto',
          color: token.colorText,
          lineHeight: token.lineHeight,
          textAlign: 'start',
        },
        '&-today': {
          borderColor: token.colorPrimary,
          [`${calendarCls}-date-value`]: {
            color: token.colorText,
          },
        },
      },
    },
    [`@media only screen and (max-width: ${token.screenXS}px) `]: {
      [`${calendarCls}`]: {
        [`${calendarCls}-header`]: {
          display: 'block',
          [`${calendarCls}-year-select`]: {
            width: '50%',
          },
          [`${calendarCls}-month-select`]: {
            width: `calc(50% - ${token.paddingXS}px)`,
          },
          [`${calendarCls}-mode-switch`]: {
            width: '100%',
            marginTop: token.marginXS,
            marginInlineStart: 0,
            '> label': {
              width: '50%',
              textAlign: 'center',
            },
          },
        },
      },
    },
  };
};

export default genComponentStyleHook('Calendar', token => {
  const calendarCls = `${token.componentCls}-calendar`;
  const calendarToken = mergeToken<CalendarToken>(
    initInputToken<FullToken<'Calendar'>>(token),
    initPickerPanelToken(token),
    {
      calendarCls,
      pickerCellInnerCls: `${token.componentCls}-cell-inner`,
      calendarFullBg: token.colorBgComponent,
      calendarFullPanelBg: token.colorBgComponent,
      calendarItemActiveBg: token.controlItemBgActive,
    },
  );

  return [genCalendarStyles(calendarToken)];
});
