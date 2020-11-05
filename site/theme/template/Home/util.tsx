/* eslint-disable import/prefer-default-export */

export function preLoad(list: string[]) {
  if (typeof window !== 'undefined') {
    // 图处预加载；
    const div = document.createElement('div');
    div.style.display = 'none';
    document.body.appendChild(div);
    list.forEach(src => {
      const img = new Image();
      img.src = src;
      div.appendChild(img);
    });
  }
}

const siteData: { [prefix: string]: any } = {};
export function getSiteData(keys: Array<string | number> = []): any {
  const prefix = keys.shift()!;

  const isBrowser = (): boolean =>
    typeof window !== 'undefined' &&
    typeof window.document !== 'undefined' &&
    typeof window.document.createElement !== 'undefined';

  if (!isBrowser) return null;

  const getData = () =>
    keys.reduce((data, key) => {
      return data[key];
    }, siteData[prefix]);

  if (siteData[prefix]) {
    return Promise.resolve(getData());
  }

  return fetch(`http://my-json-server.typicode.com/ant-design/website-data/${prefix}`)
    .then(res => res.json())
    .then((data: any) => {
      siteData[prefix] = data;
      return getData();
    });
}
