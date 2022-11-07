import React, { ReactNode, type FC, useMemo } from 'react';
import { useIntl, useRouteMeta } from 'dumi';
import Footer from 'dumi/theme/slots/Footer';
import { Col, Typography, Avatar, Tooltip, Affix, Anchor } from 'antd';
import EditButton from '../../common/EditButton';
import { FormattedMessage } from 'react-intl';
import useLocation from '../../../hooks/useLocation';
import ContributorsList from '@qixian.cs/github-contributors-list';
import useSiteToken from '../../../hooks/useSiteToken';
import { css } from '@emotion/react';
import PrevAndNext from '../../common/PrevAndNext';

const useStyle = () => {
  const { token } = useSiteToken();

  const { antCls } = token;

  return {
    contributorsList: css`
      display: flex;
      flex-wrap: wrap;
      margin-top: 120px !important;

      a,
      ${antCls}-avatar + ${antCls}-avatar {
        margin-bottom: 8px;
        margin-inline-end: 8px;
      }
    `,
    toc: css`
      ${antCls}-anchor-link-title {
        font-size: 12px;
      }
    `,
    tocWrapper: css`
      position: absolute;
      top: 8px;
      right: 0;
      width: 146px;
      margin: 12px 0;
      padding: 8px;
      backdrop-filter: blur(8px);
      border-radius: ${token.borderRadius}px;
      overflow: hidden;

      > div {
        box-sizing: border-box;
        width: 100%;
        max-height: calc(100vh - 40px);
        margin: 0 auto;
        overflow: auto;
        padding-inline-end: 4px;

        ::-webkit-scrollbar {
          width: 8px;
          background-color: transparent;
        }

        /* background of the scrollbar except button or resizer */
        ::-webkit-scrollbar-track {
          background-color: transparent;
        }

        /* scrollbar itself */
        ::-webkit-scrollbar-thumb {
          background-color: ${token.colorFill};
          border-radius: 8px;
        }

        /* set button(top and bottom of the scrollbar) */
        ::-webkit-scrollbar-button {
          display: none;
        }
      }
    `,
  };
};

type AnchorItem = {
  id: string;
  title: string;
  children?: AnchorItem[];
};

const Content: FC<{ children: ReactNode }> = ({ children }) => {
  console.log('route meta', useRouteMeta());
  const meta = useRouteMeta();
  const { pathname } = useLocation();
  const { formatMessage } = useIntl();
  const styles = useStyle();

  const anchorItems = useMemo(() => {
    return meta.toc.reduce<AnchorItem[]>((result, item) => {
      if (item.depth === 2) {
        result.push({ ...item });
      } else if (item.depth === 3) {
        const parent = result[result.length - 1];
        console.log(parent);
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push({ ...item });
        }
      }
      return result;
    }, []);
  }, [meta.toc]);

  return (
    <Col xxl={20} xl={19} lg={18} md={18} sm={24} xs={24}>
      <Affix>
        <div css={styles.tocWrapper}>
          <div>
            <Anchor css={styles.toc} affix={false} showInkInFixed>
              {anchorItems.map(item => (
                <Anchor.Link href={`#${item.id}`} title={item.title} key={item.id}>
                  {item.children?.map(child => (
                    <Anchor.Link href={`#${child.id}`} title={child.title} key={child.id} />
                  ))}
                </Anchor.Link>
              ))}
            </Anchor>
          </div>
        </div>
      </Affix>
      <div style={{ padding: '0 170px 32px 64px' }}>
        <Typography.Title level={2}>
          {meta.frontmatter.title}
          {meta.frontmatter.subtitle && (
            <span style={{ marginLeft: 12 }}>{meta.frontmatter.subtitle}</span>
          )}
          {!pathname.startsWith('/components/overview') && (
            <EditButton
              title={<FormattedMessage id="app.content.edit-page" />}
              filename={meta.frontmatter.filename}
            />
          )}
        </Typography.Title>
        {children}
        <ContributorsList
          css={styles.contributorsList}
          fileName={meta.frontmatter.filename ?? ''}
          renderItem={(item, loading) =>
            loading ? (
              <Avatar style={{ opacity: 0.3 }} />
            ) : (
              item && (
                <Tooltip
                  title={`${formatMessage({ id: 'app.content.contributors' })}: ${item.username}`}
                  key={item.username}
                >
                  <a
                    href={`https://github.com/${item.username}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Avatar src={item.url}>{item.username}</Avatar>
                  </a>
                </Tooltip>
              )
            )
          }
          repo="ant-design"
          owner="ant-design"
        />
      </div>
      <PrevAndNext />
      <Footer />
    </Col>
  );
};

export default Content;
