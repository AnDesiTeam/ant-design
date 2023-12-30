const $ = require('dekko');

const chalk = await import('chalk').then((mod) => mod.default);

$('dist')
  .isDirectory()
  .hasFile('antd-with-locales.js')
  .hasFile('antd-with-locales.min.js')
  .hasFile('antd.js')
  .hasFile('antd.min.js')
  .hasFile('reset.css');

// eslint-disable-next-line no-console
console.log(chalk.green('✨ `dist` directory is valid.'));
