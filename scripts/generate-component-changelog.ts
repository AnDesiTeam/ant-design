/* eslint-disable no-loop-func */
// Collect from `changelog.md` to get all components changelog
import path from 'path';
import fs from 'fs-extra';
import { globSync } from 'glob';

const output = '.dumi/public';

// Collect components
const componentNames = globSync(
  path.join(process.cwd(), 'components/!(version|icon|col|row)/index.zh-CN.md'),
).map((filePath) => filePath.match(/components\/([^/]*)\//)![1]);

const camelComponentNames = componentNames.map((componentName) =>
  componentName
    .split('-')
    .map((cell) => (cell.length <= 2 ? cell.toUpperCase() : cell[0].toUpperCase() + cell.slice(1)))
    .join(''),
);

// Convert a mapping logic
const componentNameMap: Record<string, string[]> = {};
camelComponentNames.forEach((name) => {
  componentNameMap[name] = [name, '[Global]'];
});

componentNameMap.ConfigProvider.push('Wave');
componentNameMap.Grid.push('Row', 'Col');
componentNameMap.Message.push('message');
componentNameMap.Notification.push('notification');

// Collect misc. When ComponentName not match will fallback to misc
const miscKeys = [
  'ComponentToken',
  'Component Token',
  'Design Token',
  'Arrow',
  '箭头',
  '@ant-design/cssinjs',
  '@ant-design/icons',
  ' IE ',
  'reset.css',
  '📖',
  '🛠',
  '🌐',
  ' locale ',
  ' RTL ',
  '🇧🇪',
  '🇨🇦',
  '🇪🇸',
  '🇷🇺',
  '🇺🇦',
  '🇲🇲',
  '🇸🇪',
  '🇻🇳',
  '🇮🇳',
  '🇮🇷',
  '🇰🇷',
  '🇩🇪',
  '🇱🇹',
];

function syncChangelog(sourceFile: string, targetFile: string) {
  const content = fs.readFileSync(sourceFile).toString();

  // let lastGroup = '';
  let lastVersion = '';

  // Split with lines
  const lines = content.split(/[\n\r]+/).filter((line) => line.trim());

  // Changelog map
  const componentChangelog: Record<string, { version: string; changelog: string }[]> = {};
  Object.keys(componentNameMap).forEach((name) => {
    componentChangelog[name] = [];
  });

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];

    // Skip for v5 release
    if (line === '## 5.0.0') {
      break;
    }

    // Get version
    if (line.startsWith('## ')) {
      lastVersion = line.replace('## ', '');
      continue;
    }

    // Start when get version
    if (!lastVersion) {
      continue;
    }

    // Group end
    if (line.startsWith('- ')) {
      // lastGroup = '';
    }

    // Group check
    if (line.startsWith('- ') && lines[i + 1].startsWith('  - ')) {
      // lastGroup = line.replace('- ', '');
      continue;
    }

    // Filter not is changelog
    if (!line.trim().startsWith('-') && !line.includes('github.')) {
      continue;
    }

    // Collect Components
    let matched = false;
    Object.keys(componentNameMap).forEach((name) => {
      const matchKeys = componentNameMap[name];

      if (matchKeys.some((key) => line.includes(key))) {
        componentChangelog[name].push({
          version: lastVersion,
          changelog: line,
        });
        matched = true;
      }
    });

    if (matched) {
      continue;
    }

    // Misc
    if (miscKeys.some((key) => line.includes(key))) {
      continue;
    }

    if (!matched) {
      console.log(line);
    }
  }

  // console.log(componentChangelog);

  fs.writeFileSync(path.join(output, targetFile), JSON.stringify(componentChangelog), 'utf-8');
}

(() => {
  syncChangelog('CHANGELOG.zh-CN.md', 'components-changelog-cn.json');
  syncChangelog('CHANGELOG.en-US.md', 'components-changelog-en.json');
})();
