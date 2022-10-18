import React from 'react';
/*
 * debug: true
 */

import { Tooltip } from 'antd';

const App: React.FC = () => (
  <Tooltip destroyTooltipOnHide={{ keepParent: false }} title="prompt text">
    <span>Tooltip will destroy when hidden.</span>
  </Tooltip>
);

export default App;
