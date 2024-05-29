import React from 'react';
import { Form, Input } from 'antd';

const App: React.FC = () => (
  <>
    <Form name="demo" layout="vertical" labelCol={{ span: 8 }} wrapperCol={{ span: 16 }}>
      <Form.Item label="name" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        label="loooooooooooooooooooooooooooooooong"
        name="age"
        rules={[{ required: true }]}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
        <Input />
      </Form.Item>
    </Form>
    <hr />
    <Form
      name="layout-multiple"
      layout="horizontal"
      labelCol={{ span: 4 }}
      wrapperCol={{ span: 20 }}
    >
      <Form.Item label="name" name="name" rules={[{ required: true }]}>
        <Input />
      </Form.Item>
      <Form.Item
        layout="vertical"
        label="loooooooooooooooooooooooooooooooong"
        name="age"
        rules={[{ required: true }]}
        labelCol={{ span: 24 }}
        wrapperCol={{ span: 24 }}
      >
        <Input />
      </Form.Item>
    </Form>
  </>
);

export default App;
