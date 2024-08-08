import React from 'react';
import { Splitter } from 'antd';

const App: React.FC = () => (
  <Splitter
    layout="vertical"
    style={{
      height: 300,
      borderRadius: '4px',
      border: '1px solid #e5e7eb',
    }}
  >
    <Splitter.Panel defaultSize={40} collapsible={{ prev: true }}>
      <div style={{ padding: 12 }}>
        <div>1</div>
        <div>defaultSize=40</div>
        <div>{`collapsible={ prev: true }`}</div>
      </div>
    </Splitter.Panel>

    <Splitter.Panel>
      <Splitter>
        <Splitter.Panel resizable={false}>
          <div style={{ padding: 12 }}>
            <div>2</div>
            <div>resizable=false</div>
          </div>
        </Splitter.Panel>

        <Splitter.Panel>
          <Splitter layout="vertical">
            <Splitter.Panel collapsible defaultSize="100px">
              <div style={{ padding: 12 }}>
                <div>3</div>
                <div>collapsible=true</div>
                <div>defaultSize=120px</div>
              </div>
            </Splitter.Panel>

            <Splitter.Panel>
              <div>4</div>
            </Splitter.Panel>
          </Splitter>
        </Splitter.Panel>

        <Splitter.Panel>
          <div>5</div>
        </Splitter.Panel>
      </Splitter>
    </Splitter.Panel>
  </Splitter>
);

export default App;
