import { createTheme } from '@ant-design/cssinjs';
import IconContext from '@ant-design/icons/lib/components/Context';
import { FormProvider as RcFormProvider } from 'rc-field-form';
import type { ValidateMessages } from 'rc-field-form/lib/interface';
import { setValues } from 'rc-field-form/lib/utils/valueUtil';
import useMemo from 'rc-util/lib/hooks/useMemo';
import type { ReactElement } from 'react';
import * as React from 'react';
import type { Options } from 'scroll-into-view-if-needed';
import warning from '../_util/warning';
import type { RequiredMark } from '../form/Form';
import type { Locale } from '../locale';
import LocaleProvider, { ANT_MARK } from '../locale';
import type { LocaleContextProps } from '../locale/context';
import LocaleContext from '../locale/context';
import defaultLocale from '../locale/en_US';
import { DesignTokenContext } from '../theme/internal';
import defaultSeedToken from '../theme/themes/seed';
import type {
  ConfigConsumerProps,
  CSPConfig,
  DirectionType,
  PopupOverflow,
  Theme,
  ThemeConfig,
} from './context';
import { ConfigConsumer, ConfigContext, defaultIconPrefixCls } from './context';
import { registerTheme } from './cssVariables';
import type { RenderEmptyHandler } from './defaultRenderEmpty';
import { DisabledContextProvider } from './DisabledContext';
import useConfig from './hooks/useConfig';
import useTheme from './hooks/useTheme';
import MotionWrapper from './MotionWrapper';
import type { SizeType } from './SizeContext';
import SizeContext, { SizeContextProvider } from './SizeContext';
import useStyle from './style';

/**
 * Since too many feedback using static method like `Modal.confirm` not getting theme,
 * we record the theme register info here to help developer get warning info.
 */
let existThemeConfig = false;

export const warnContext: (componentName: string) => void =
  process.env.NODE_ENV !== 'production'
    ? (componentName: string) => {
        warning(
          !existThemeConfig,
          componentName,
          `Static function can not consume context like dynamic theme. Please use 'App' component instead.`,
        );
      }
    : /* istanbul ignore next */
      null!;

export {
  type RenderEmptyHandler,
  ConfigContext,
  ConfigConsumer,
  type CSPConfig,
  type DirectionType,
  type ConfigConsumerProps,
  type ThemeConfig,
};
export { defaultIconPrefixCls };

export const configConsumerProps = [
  'getTargetContainer',
  'getPopupContainer',
  'rootPrefixCls',
  'getPrefixCls',
  'renderEmpty',
  'csp',
  'autoInsertSpaceInButton',
  'locale',
  'pageHeader',
];

// These props is used by `useContext` directly in sub component
const PASSED_PROPS: Exclude<keyof ConfigConsumerProps, 'rootPrefixCls' | 'getPrefixCls'>[] = [
  'getTargetContainer',
  'getPopupContainer',
  'renderEmpty',
  'pageHeader',
  'input',
  'pagination',
  'form',
  'select',
];

export interface ConfigProviderProps {
  getTargetContainer?: () => HTMLElement | Window;
  getPopupContainer?: (triggerNode?: HTMLElement) => HTMLElement;
  prefixCls?: string;
  iconPrefixCls?: string;
  children?: React.ReactNode;
  renderEmpty?: RenderEmptyHandler;
  csp?: CSPConfig;
  autoInsertSpaceInButton?: boolean;
  form?: {
    validateMessages?: ValidateMessages;
    requiredMark?: RequiredMark;
    colon?: boolean;
    scrollToFirstError?: Options | boolean;
  };
  input?: {
    autoComplete?: string;
  };
  select?: {
    showSearch?: boolean;
  };
  pagination?: {
    showSizeChanger?: boolean;
  };
  locale?: Locale;
  pageHeader?: {
    ghost: boolean;
  };
  componentSize?: SizeType;
  componentDisabled?: boolean;
  direction?: DirectionType;
  space?: {
    size?: SizeType | number;
  };
  virtual?: boolean;
  /** @deprecated Please use `popupMatchSelectWidth` instead */
  dropdownMatchSelectWidth?: boolean;
  popupMatchSelectWidth?: boolean;
  popupOverflow?: PopupOverflow;
  theme?: ThemeConfig;
}

interface ProviderChildrenProps extends ConfigProviderProps {
  parentContext: ConfigConsumerProps;
  legacyLocale: Locale;
}

export const defaultPrefixCls = 'ant';
let globalPrefixCls: string;
let globalIconPrefixCls: string;
let globalTheme: ThemeConfig;

function getGlobalPrefixCls() {
  return globalPrefixCls || defaultPrefixCls;
}

function getGlobalIconPrefixCls() {
  return globalIconPrefixCls || defaultIconPrefixCls;
}

function isLegacyTheme(theme: Theme | ThemeConfig): theme is Theme {
  return Object.keys(theme).some((key) => key.endsWith('Color'));
}

const setGlobalConfig = ({
  prefixCls,
  iconPrefixCls,
  theme,
}: Pick<ConfigProviderProps, 'prefixCls' | 'iconPrefixCls'> & { theme?: Theme | ThemeConfig }) => {
  if (prefixCls !== undefined) {
    globalPrefixCls = prefixCls;
  }
  if (iconPrefixCls !== undefined) {
    globalIconPrefixCls = iconPrefixCls;
  }

  if (theme) {
    if (isLegacyTheme(theme)) {
      warning(
        false,
        'ConfigProvider',
        '`config` of css variable theme is not work in v5. Please use new `theme` config instead.',
      );
      registerTheme(getGlobalPrefixCls(), theme);
    } else {
      globalTheme = theme;
    }
  }
};

export const globalConfig = () => ({
  getPrefixCls: (suffixCls?: string, customizePrefixCls?: string) => {
    if (customizePrefixCls) return customizePrefixCls;
    return suffixCls ? `${getGlobalPrefixCls()}-${suffixCls}` : getGlobalPrefixCls();
  },
  getIconPrefixCls: getGlobalIconPrefixCls,
  getRootPrefixCls: () => {
    // If Global prefixCls provided, use this
    if (globalPrefixCls) {
      return globalPrefixCls;
    }

    // Fallback to default prefixCls
    return getGlobalPrefixCls();
  },
  getTheme: () => globalTheme,
});

const ProviderChildren: React.FC<ProviderChildrenProps> = (props) => {
  const {
    children,
    csp: customCsp,
    autoInsertSpaceInButton,
    form,
    locale,
    componentSize,
    direction,
    space,
    virtual,
    dropdownMatchSelectWidth,
    popupMatchSelectWidth,
    popupOverflow,
    legacyLocale,
    parentContext,
    iconPrefixCls: customIconPrefixCls,
    theme,
    componentDisabled,
  } = props;

  // =================================== Warning ===================================
  if (process.env.NODE_ENV !== 'production') {
    warning(
      dropdownMatchSelectWidth === undefined,
      'ConfigProvider',
      '`dropdownMatchSelectWidth` is deprecated. Please use `popupMatchSelectWidth` instead.',
    );
  }

  // =================================== Context ===================================
  const getPrefixCls = React.useCallback(
    (suffixCls: string, customizePrefixCls?: string) => {
      const { prefixCls } = props;

      if (customizePrefixCls) return customizePrefixCls;

      const mergedPrefixCls = prefixCls || parentContext.getPrefixCls('');

      return suffixCls ? `${mergedPrefixCls}-${suffixCls}` : mergedPrefixCls;
    },
    [parentContext.getPrefixCls, props.prefixCls],
  );

  const iconPrefixCls = customIconPrefixCls || parentContext.iconPrefixCls || defaultIconPrefixCls;
  const shouldWrapSSR = iconPrefixCls !== parentContext.iconPrefixCls;
  const csp = customCsp || parentContext.csp;

  const wrapSSR = useStyle(iconPrefixCls, csp);

  const mergedTheme = useTheme(theme, parentContext.theme);

  if (process.env.NODE_ENV !== 'production') {
    existThemeConfig = existThemeConfig || !!mergedTheme;
  }

  const baseConfig = {
    csp,
    autoInsertSpaceInButton,
    locale: locale || legacyLocale,
    direction,
    space,
    virtual,
    popupMatchSelectWidth: popupMatchSelectWidth ?? dropdownMatchSelectWidth,
    popupOverflow,
    getPrefixCls,
    iconPrefixCls,
    theme: mergedTheme,
  };

  const config = {
    ...parentContext,
  };

  Object.keys(baseConfig).forEach((key: keyof typeof baseConfig) => {
    if (baseConfig[key] !== undefined) {
      (config as any)[key] = baseConfig[key];
    }
  });

  // Pass the props used by `useContext` directly with child component.
  // These props should merged into `config`.
  PASSED_PROPS.forEach((propName) => {
    const propValue = props[propName];
    if (propValue) {
      (config as any)[propName] = propValue;
    }
  });

  // https://github.com/ant-design/ant-design/issues/27617
  const memoedConfig = useMemo(
    () => config,
    config,
    (prevConfig, currentConfig) => {
      const prevKeys = Object.keys(prevConfig) as Array<keyof typeof config>;
      const currentKeys = Object.keys(currentConfig) as Array<keyof typeof config>;
      return (
        prevKeys.length !== currentKeys.length ||
        prevKeys.some((key) => prevConfig[key] !== currentConfig[key])
      );
    },
  );

  const memoIconContextValue = React.useMemo(
    () => ({ prefixCls: iconPrefixCls, csp }),
    [iconPrefixCls, csp],
  );

  let childNode = shouldWrapSSR ? wrapSSR(children as ReactElement) : children;

  const validateMessages = React.useMemo(
    () =>
      setValues(
        {},
        defaultLocale.Form?.defaultValidateMessages || {},
        memoedConfig.locale?.Form?.defaultValidateMessages || {},
        form?.validateMessages || {},
      ),
    [memoedConfig, form?.validateMessages],
  );

  if (Object.keys(validateMessages).length > 0) {
    childNode = <RcFormProvider validateMessages={validateMessages}>{children}</RcFormProvider>;
  }

  if (locale) {
    childNode = (
      <LocaleProvider locale={locale} _ANT_MARK__={ANT_MARK}>
        {childNode}
      </LocaleProvider>
    );
  }

  if (iconPrefixCls || csp) {
    childNode = (
      <IconContext.Provider value={memoIconContextValue}>{childNode}</IconContext.Provider>
    );
  }

  if (componentSize) {
    childNode = <SizeContextProvider size={componentSize}>{childNode}</SizeContextProvider>;
  }

  // =================================== Motion ===================================
  childNode = <MotionWrapper>{childNode}</MotionWrapper>;

  // ================================ Dynamic theme ================================
  const memoTheme = React.useMemo(() => {
    const { algorithm, token, ...rest } = mergedTheme || {};
    const themeObj =
      algorithm && (!Array.isArray(algorithm) || algorithm.length > 0)
        ? createTheme(algorithm)
        : undefined;

    return {
      ...rest,
      theme: themeObj,

      token: {
        ...defaultSeedToken,
        ...token,
      },
    };
  }, [mergedTheme]);

  if (theme) {
    childNode = (
      <DesignTokenContext.Provider value={memoTheme}>{childNode}</DesignTokenContext.Provider>
    );
  }

  // =================================== Render ===================================
  if (componentDisabled !== undefined) {
    childNode = (
      <DisabledContextProvider disabled={componentDisabled}>{childNode}</DisabledContextProvider>
    );
  }

  return <ConfigContext.Provider value={memoedConfig}>{childNode}</ConfigContext.Provider>;
};

const ConfigProvider: React.FC<ConfigProviderProps> & {
  /** @private internal Usage. do not use in your production */
  ConfigContext: typeof ConfigContext;
  /** @deprecated Please use `ConfigProvider.useConfig().componentSize` instead */
  SizeContext: typeof SizeContext;
  config: typeof setGlobalConfig;
  useConfig: typeof useConfig;
} = (props) => {
  const context = React.useContext<ConfigConsumerProps>(ConfigContext);
  const antLocale = React.useContext<LocaleContextProps | undefined>(LocaleContext);
  return <ProviderChildren parentContext={context} legacyLocale={antLocale!} {...props} />;
};

ConfigProvider.ConfigContext = ConfigContext;
ConfigProvider.SizeContext = SizeContext;
ConfigProvider.config = setGlobalConfig;
ConfigProvider.useConfig = useConfig;

Object.defineProperty(ConfigProvider, 'SizeContext', {
  get: () => {
    warning(
      false,
      'ConfigProvider',
      'ConfigProvider.SizeContext is deprecated. Please use `ConfigProvider.useConfig().componentSize` instead.',
    );
    return SizeContext;
  },
});

if (process.env.NODE_ENV !== 'production') {
  ConfigProvider.displayName = 'ConfigProvider';
}

export default ConfigProvider;
