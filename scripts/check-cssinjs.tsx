/* eslint-disable no-console */
import {
  StyleProvider,
  legacyNotSelectorLinter,
  logicalPropertiesLinter,
  parentSelectorLinter,
  createCache,
  extractStyle,
} from '@ant-design/cssinjs';
import chalk from 'chalk';
import React from 'react';
import ReactDOMServer from 'react-dom/server';
import { generateCssinjs } from './generate-cssinjs';
import { ConfigProvider } from '../components';

console.log(chalk.green(`🔥 Checking CSS-in-JS...`));

let errorCount = 0;
const originError = console.error;
console.error = (msg: any) => {
  if (msg.includes('Warning: [Ant Design CSS-in-JS]')) {
    errorCount += 1;
    console.log(chalk.red(`❌ `), msg.replace(/\s+/g, ' '));
  } else {
    originError(msg);
  }
};

async function checkCSSVar() {
  const cache = createCache();

  const ignore = [
    'affix',
    'alert',
    'anchor',
    'auto-complete',
    'avatar',
    'back-top',
    'badge',
    'breadcrumb',
    'calendar',
    'card',
    'carousel',
    'cascader',
    'checkbox',
    'collapse',
    'color-picker',
    'date-picker',
    'descriptions',
    'divider',
    'drawer',
    'dropdown',
    'empty',
    'flex',
    'float-button',
    'form',
    'grid',
    'icon',
    'image',
    'input-number',
    'layout',
    'list',
    'mentions',
    'message',
    'modal',
    'notification',
    'pagination',
    'popconfirm',
    'popover',
    'progress',
    'qr-code',
    'radio',
    'rate',
    'result',
    'segmented',
    'select',
    'skeleton',
    'slider',
    'space',
    'spin',
    'statistic',
    'steps',
    'switch',
    'table',
    'tabs',
    'tag',
    'timeline',
    'transfer',
    'tree',
    'tree-select',
    'typography',
    'upload',
    'watermark',
  ];

  await generateCssinjs({
    key: 'check',
    ignore,
    render(Component: any) {
      ReactDOMServer.renderToString(
        <StyleProvider cache={cache}>
          <ConfigProvider theme={{ cssVar: true, hashed: false }}>
            <Component />
          </ConfigProvider>
        </StyleProvider>,
      );
    },
  });

  const style = extractStyle(cache);
  const NaNList = style.match(/[\S\s]{0,100}NaN[\S\s]{0,100}/g);
  if (NaNList) {
    NaNList.forEach((s) => {
      console.error(`Warning: [Ant Design CSS-in-JS]: Unexpected 'NaN' in style. Context: ${s}`);
    });
  }
}

(async () => {
  await generateCssinjs({
    key: 'check',
    render(Component: any) {
      ReactDOMServer.renderToString(
        <StyleProvider
          linters={[logicalPropertiesLinter, legacyNotSelectorLinter, parentSelectorLinter]}
        >
          <Component />
        </StyleProvider>,
      );
    },
  });

  await checkCSSVar();

  if (errorCount > 0) {
    console.log(chalk.red(`❌  CSS-in-JS check failed with ${errorCount} errors.`));
    process.exit(1);
  } else {
    console.log(chalk.green(`✅  CSS-in-JS check passed.`));
  }
})();
