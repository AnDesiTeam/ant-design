import React from 'react';
/*
 * debug: true
 */

import { ArrowDownOutlined, ArrowUpOutlined } from '@ant-design/icons';
import { InputNumber } from 'antd';

const App: React.FC = () => (
  <InputNumber controls={{ upIcon: <ArrowUpOutlined />, downIcon: <ArrowDownOutlined /> }} />
);

export default App;
