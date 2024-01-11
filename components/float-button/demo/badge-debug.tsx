import React, { useState } from 'react';
import { ConfigProvider, FloatButton, Slider } from 'antd';
import type { GetProp } from 'antd';

type AliasToken = GetProp<typeof ConfigProvider, 'theme'>['token'];

const App: React.FC = () => {
  const [radius, setRadius] = useState<number>(0);

  const token: Partial<AliasToken> = {
    borderRadius: radius,
  };

  return (
    <>
      <Slider min={0} max={20} style={{ margin: 16 }} onChange={setRadius} />
      <ConfigProvider theme={{ token }}>
        <FloatButton shape="square" badge={{ dot: true }} />
      </ConfigProvider>
    </>
  );
};

export default App;
