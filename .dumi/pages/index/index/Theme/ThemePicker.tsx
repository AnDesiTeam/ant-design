import { css } from '@emotion/react';
import { Space } from 'antd';
import * as React from 'react';
import useSiteToken from '../../../../hooks/useSiteToken';
import useLocale from '../../../../hooks/useLocale';

export const THEMES = {
  default: 'https://gw.alipayobjects.com/zos/bmw-prod/ae669a89-0c65-46db-b14b-72d1c7dd46d6.svg',
  dark: 'https://gw.alipayobjects.com/zos/bmw-prod/0f93c777-5320-446b-9bb7-4d4b499f346d.svg',
  lark: 'https://gw.alipayobjects.com/zos/bmw-prod/3e899b2b-4eb4-4771-a7fc-14c7ff078aed.svg',
  comic: 'https://gw.alipayobjects.com/zos/bmw-prod/ed9b04e8-9b8d-4945-8f8a-c8fc025e846f.svg',
} as const;

export type THEME = keyof typeof THEMES;

const locales = {
  cn: {
    default: '默认',
    dark: '暗黑',
    lark: '知识协作',
    comic: '二次元',
  },
  en: {
    default: 'Default',
    dark: 'Dark',
    lark: 'Document',
    comic: 'Comic',
  },
};

const useStyle = () => {
  const { token } = useSiteToken();

  return {
    themeCard: css`
      border-radius: ${token.radiusBase}px;
      cursor: pointer;
      outline-offset: 1px;
      transition: all ${token.motionDurationSlow};
      box-shadow: 0 3px 6px -4px rgba(0, 0, 0, 0.12), 0 6px 16px 0 rgba(0, 0, 0, 0.08),
        0 9px 28px 8px rgba(0, 0, 0, 0.05);
    `,

    themeCardActive: css`
      outline: ${token.controlOutlineWidth * 2}px solid ${token.colorPrimary};
    `,
  };
};

export interface ThemePickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export default function ThemePicker({ value, onChange }: ThemePickerProps) {
  const { token } = useSiteToken();
  const style = useStyle();

  const [locale] = useLocale(locales);

  return (
    <Space size={token.paddingLG}>
      {Object.keys(THEMES).map(theme => {
        const url = THEMES[theme as THEME];

        return (
          <Space direction="vertical" align="center">
            <img
              key={theme}
              src={url}
              css={[style.themeCard, value === theme && style.themeCardActive]}
              onClick={() => {
                onChange?.(theme);
              }}
            />
            <span>{locale[theme as keyof typeof locale]}</span>
          </Space>
        );
      })}
    </Space>
  );
}
