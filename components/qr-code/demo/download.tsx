import React from 'react';
import { QrCode, Button } from 'antd';

const downloadQrCode = () => {
  const canvas = document.getElementById('myqrcode')?.querySelector('canvas');
  const url = canvas?.toDataURL() || '';
  const a = document.createElement('a');
  a.download = 'qr-code.png';
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
};

const App: React.FC = () => (
  <div id="myqrcode">
    <QrCode value="https://ant.design/" />
    <Button style={{ marginBlockStart: 16 }} onClick={downloadQrCode}>
      下载二维码
    </Button>
  </div>
);

export default App;
