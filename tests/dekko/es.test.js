const $ = require('dekko');
const chalk = require('chalk');

$('es').isDirectory().hasFile('index.js').hasFile('index.d.ts');

$('es/*')
  .filter(
    (filename) =>
      !filename.endsWith('index.js') &&
      !filename.endsWith('index.d.ts') &&
      !filename.endsWith('.map'),
  )
  .isDirectory()
  .filter(
    (filename) =>
      !filename.endsWith('style') && !filename.endsWith('_util') && !filename.endsWith('locale'),
  )
  .hasFile('index.js')
  .hasFile('index.d.ts');

// eslint-disable-next-line no-console
console.log(chalk.green('✨ `es` directory is valid.'));
