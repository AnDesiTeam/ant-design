import { css } from '@emotion/react';
import { Button, Card } from 'antd';
import React from 'react';
import useLocale from '../../../hooks/useLocale';
import useSiteToken from '../../../hooks/useSiteToken';

const ANTD_IMG_URL =
  'https://picx.zhimg.com/v2-3b2bca09c2771e7a82a81562e806be4d.jpg?source=d16d100b';

const useStyle = () => {
  const { token } = useSiteToken();
  return {
    card: css`
      width: 100%;
      margin: 40px 0;
      transition: all 0.2s;
      background-color: ${token.colorFillQuaternary};
    `,
    bigTitle: css`
      font-size: 16px;
      color: #121212;
      margin-bottom: 24px;
      font-weight: 600;
    `,
    cardBody: css`
      display: flex;
      justify-content: space-between;
      align-items: center;
    `,
    left: css`
      display: flex;
      justify-content: flex-start;
      align-items: center;
      img {
        width: 200px;
        margin-right: 24px;
        overflow: hidden;
        border-radius: 8px;
      }
    `,
    title: css`
      color: #444;
      font-size: 16px;
      font-weight: 600;
    `,
    subTitle: css`
      color: #646464;
      font-size: 14px;
      font-weight: 400;
      margin-top: 8px;
    `,
  };
};

const locales = {
  cn: {
    bigTitle: '文章被收录于知乎专栏：',
    subTitle: '一个 UI 设计体系',
    buttonText: '我有想法，去参与讨论',
  },
  en: {
    bigTitle: 'Articles are included in the column:',
    subTitle: 'A UI design system',
    buttonText: 'Go to discuss',
  },
};

interface Props {
  link?: string;
}

const ZhihuCard: React.FC<Props> = ({ link }) => {
  const [locale] = useLocale(locales);
  const { card, bigTitle, cardBody, left, title, subTitle } = useStyle();
  if (!link) {
    return null;
  }
  return (
    <Card css={card} bordered={false}>
      <h3 css={bigTitle}>{locale.bigTitle}</h3>
      <div css={cardBody}>
        <div css={left}>
          <img src={ANTD_IMG_URL} alt="antd" />
          <div>
            <p css={title}>Ant Design</p>
            <p css={subTitle}>{locale.subTitle}</p>
          </div>
        </div>
        <Button type="primary" target="_blank" href={link}>
          {locale.buttonText}
        </Button>
      </div>
    </Card>
  );
};

export default ZhihuCard;
