import { mount } from 'enzyme';
import React, { Component, useState } from 'react';
import scrollIntoView from 'scroll-into-view-if-needed';
import userEvent from '@testing-library/user-event';
import classNames from 'classnames';
import Form from '..';
import * as Util from '../util';

import Button from '../../button';
import Input from '../../input';
import Select from '../../select';
import Upload from '../../upload';
import Cascader from '../../cascader';
import Checkbox from '../../checkbox';
import DatePicker from '../../date-picker';
import InputNumber from '../../input-number';
import Radio from '../../radio';
import Switch from '../../switch';
import TreeSelect from '../../tree-select';

import mountTest from '../../../tests/shared/mountTest';
import rtlTest from '../../../tests/shared/rtlTest';
import { fireEvent, render, sleep, act, screen } from '../../../tests/utils';
import ConfigProvider from '../../config-provider';
import Drawer from '../../drawer';
import zhCN from '../../locale/zh_CN';
import Modal from '../../modal';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

jest.mock('scroll-into-view-if-needed');

describe('Form', () => {
  mountTest(Form);
  mountTest(Form.Item);

  rtlTest(Form);
  rtlTest(Form.Item);

  scrollIntoView.mockImplementation(() => {});
  const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

  async function change(container, index, value, executeMockTimer) {
    fireEvent.change(container.querySelectorAll('input')[index], {
      target: { value },
    });
    await sleep(200);

    if (executeMockTimer) {
      for (let i = 0; i < 10; i += 1) {
        act(() => {
          jest.runAllTimers();
        });
      }
      await sleep(1);
    }
  }

  beforeEach(() => {
    jest.useRealTimers();
    scrollIntoView.mockReset();
  });

  afterEach(() => {
    errorSpy.mockReset();
  });

  afterAll(() => {
    errorSpy.mockRestore();
    scrollIntoView.mockRestore();
  });

  describe('noStyle Form.Item', () => {
    it('should show alert when form field is required but empty', async () => {
      const onChange = jest.fn();

      const { container } = render(
        <Form>
          <Form.Item>
            <Form.Item name="test" label="test" initialValue="bamboo" rules={[{ required: true }]}>
              <Input onChange={onChange} />
            </Form.Item>
          </Form.Item>
        </Form>,
      );

      // user type something and clear
      await userEvent.type(screen.getByLabelText('test'), 'test');
      await userEvent.clear(screen.getByLabelText('test'));

      // should show alert with correct message and show correct styles
      await expect(screen.findByRole('alert')).resolves.toHaveTextContent("'test' is required");
      expect(screen.getByLabelText('test')).toHaveClass('ant-input-status-error');
      expect(container.querySelectorAll('.ant-form-item-has-error').length).toBeTruthy();

      expect(onChange).toHaveBeenCalled();
    });

    it('should clean up', async () => {
      jest.useFakeTimers();
      const Demo = () => {
        const [form] = Form.useForm();

        return (
          <Form form={form} initialValues={{ aaa: '2' }}>
            <Form.Item name="aaa">
              <Input
                onChange={async () => {
                  await sleep(0);
                  try {
                    await form.validateFields();
                  } catch (e) {
                    // do nothing
                  }
                }}
              />
            </Form.Item>
            <Form.Item shouldUpdate noStyle>
              {() => {
                const aaa = form.getFieldValue('aaa');

                if (aaa === '1') {
                  return (
                    <Form.Item name="bbb" rules={[{ required: true, message: 'aaa' }]}>
                      <Input />
                    </Form.Item>
                  );
                }

                return (
                  <Form.Item>
                    <Form.Item name="ccc" rules={[{ required: true, message: 'ccc' }]} noStyle>
                      <Input />
                    </Form.Item>
                  </Form.Item>
                );
              }}
            </Form.Item>
          </Form>
        );
      };

      const { container } = render(<Demo />);
      await change(container, 0, '1', true);
      expect(screen.getByRole('alert')).toHaveTextContent('aaa');
      await change(container, 0, '2', true);
      expect(screen.getByRole('alert')).toHaveTextContent('ccc');
      await change(container, 0, '1', true);
      expect(screen.getByRole('alert')).toHaveTextContent('aaa');

      jest.useRealTimers();
    });
  });

  it('`shouldUpdate` should work with render props', () => {
    render(
      <Form>
        <Form.Item>{() => null}</Form.Item>
      </Form>,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: [antd: Form.Item] `children` of render props only work with `shouldUpdate` or `dependencies`.',
    );
  });
  it("`shouldUpdate` shouldn't work with `dependencies`", () => {
    render(
      <Form>
        <Form.Item shouldUpdate dependencies={[]}>
          {() => null}
        </Form.Item>
      </Form>,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      "Warning: [antd: Form.Item] `shouldUpdate` and `dependencies` shouldn't be used together. See https://ant.design/components/form/#dependencies.",
    );
  });

  it('`name` should not work with render props', () => {
    render(
      <Form>
        <Form.Item name="test" shouldUpdate>
          {() => null}
        </Form.Item>
      </Form>,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      "Warning: [antd: Form.Item] Do not use `name` with `children` of render props since it's not a field.",
    );
  });

  it('children is array has name props', () => {
    render(
      <Form>
        <Form.Item name="test">
          <div>one</div>
          <div>two</div>
        </Form.Item>
      </Form>,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: [antd: Form.Item] `children` is array of render props cannot have `name`.',
    );
  });

  describe('scrollToField', () => {
    function test(name, genForm) {
      it(name, () => {
        let callGetForm;

        const Demo = () => {
          const { props, getForm } = genForm();
          callGetForm = getForm;

          return (
            <Form name="scroll" {...props}>
              <Form.Item name="test">
                <Input />
              </Form.Item>
            </Form>
          );
        };

        render(<Demo />);

        expect(scrollIntoView).not.toHaveBeenCalled();
        const form = callGetForm();
        form.scrollToField('test', {
          block: 'start',
        });

        const inputNode = document.getElementById('scroll_test');
        expect(scrollIntoView).toHaveBeenCalledWith(inputNode, {
          block: 'start',
          scrollMode: 'if-needed',
        });
      });
    }

    // hooks
    test('useForm', () => {
      const [form] = Form.useForm();
      return {
        props: { form },
        getForm: () => form,
      };
    });

    // ref
    test('ref', () => {
      let form;
      return {
        props: {
          ref: instance => {
            form = instance;
          },
        },
        getForm: () => form,
      };
    });
  });

  it('scrollToFirstError', async () => {
    const onFinishFailed = jest.fn();

    render(
      <Form scrollToFirstError={{ block: 'center' }} onFinishFailed={onFinishFailed}>
        <Form.Item name="test" rules={[{ required: true }]}>
          <input />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>,
      { attachTo: document.body },
    );

    expect(scrollIntoView).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: /submit/i }));
    const inputNode = document.getElementById('test');
    expect(scrollIntoView).toHaveBeenCalledWith(inputNode, {
      block: 'center',
      scrollMode: 'if-needed',
    });
    expect(onFinishFailed).toHaveBeenCalled();
  });

  it('Form.Item should support data-*、aria-* and custom attribute', () => {
    const { container } = render(
      <Form>
        <Form.Item data-text="123" aria-hidden="true" cccc="bbbb">
          text
        </Form.Item>
      </Form>,
    );
    expect(container).toMatchSnapshot();
  });

  it('warning when use `name` but children is not validate element', () => {
    render(
      <Form>
        <Form.Item name="warning">text</Form.Item>
      </Form>,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: [antd: Form.Item] `name` is only used for validate React element. If you are using Form.Item as layout display, please remove `name` instead.',
    );
  });

  it('dynamic change required', async () => {
    render(
      <Form>
        <Form.Item label="light" name="light" valuePropName="checked">
          <input type="checkbox" />
        </Form.Item>
        <Form.Item
          label="bamboo"
          name="bamboo"
          dependencies={['light']}
          rules={[({ getFieldValue }) => ({ required: getFieldValue('light') })]}
        >
          <input />
        </Form.Item>
      </Form>,
    );

    // should not show alert by default
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // click to change the light field value to true
    await userEvent.click(screen.getByLabelText('light'));

    // user input something and clear
    await userEvent.type(screen.getByLabelText('bamboo'), '1');
    await userEvent.clear(screen.getByLabelText('bamboo'));

    // should show alert says that the field is required
    await expect(screen.findByRole('alert')).resolves.toHaveTextContent("'bamboo' is required");
  });

  it('should show alert with string when help is non-empty string', () => {
    render(
      <Form>
        <Form.Item help="good">
          <input />
        </Form.Item>
      </Form>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('good');
  });

  it('should show alert with empty string when help is empty string', () => {
    render(
      <Form>
        <Form.Item help="">
          <input />
        </Form.Item>
      </Form>,
    );

    expect(screen.getByRole('alert')).toHaveTextContent('');
  });

  it('warning when use v3 function', () => {
    Form.create();
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: [antd: Form] antd v4 removed `Form.create`. Please remove or use `@ant-design/compatible` instead.',
    );
  });

  // https://github.com/ant-design/ant-design/issues/20706
  it('Error change should work', async () => {
    render(
      <Form>
        <Form.Item
          name="test"
          label="test"
          rules={[
            { required: true },
            {
              validator: (_, value) => {
                if (value === 'p') {
                  return Promise.reject(new Error('not a p'));
                }
                return Promise.resolve();
              },
            },
          ]}
        >
          <Input />
        </Form.Item>
      </Form>,
    );

    // user type something and clear
    await userEvent.type(screen.getByLabelText('test'), 'bamboo');
    await userEvent.clear(screen.getByLabelText('test'));

    await expect(screen.findByRole('alert')).resolves.toHaveTextContent("'test' is required");

    // user type value that fulfill the validator
    await userEvent.type(screen.getByLabelText('test'), 'p');

    await sleep(100);

    await expect(screen.findByRole('alert')).resolves.toHaveTextContent('not a p');

    // user clear field again
    await userEvent.clear(screen.getByLabelText('test'));

    await sleep(100);

    await expect(screen.findByRole('alert')).resolves.toHaveTextContent("'test' is required");
  });

  // https://github.com/ant-design/ant-design/issues/20813
  it('should update help directly when provided', async () => {
    function App() {
      const [message, updateMessage] = React.useState('');
      return (
        <Form>
          <Form.Item label="hello" help={message}>
            <Input />
          </Form.Item>
          <Button onClick={() => updateMessage('bamboo')} />
        </Form>
      );
    }

    render(<App />);

    // should show initial text
    expect(screen.getByRole('alert')).toHaveTextContent('');

    await userEvent.click(screen.getByRole('button'));
    await sleep(800);

    // should show bamboo alert without opacity and hide first alert with opacity: 0
    expect(screen.getByRole('alert')).toHaveTextContent('bamboo');
  });

  it('warning when use `dependencies` but `name` is empty & children is not a render props', () => {
    render(
      <Form>
        <Form.Item dependencies={[]}>text</Form.Item>
      </Form>,
    );
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: [antd: Form.Item] Must set `name` or use render props when `dependencies` is set.',
    );
  });

  // https://github.com/ant-design/ant-design/issues/20948
  it('not repeat render when Form.Item is not a real Field', async () => {
    const shouldNotRender = jest.fn();
    const StaticInput = () => {
      shouldNotRender();
      return <Input />;
    };

    const shouldRender = jest.fn();
    const DynamicInput = () => {
      shouldRender();
      return <Input />;
    };

    const formRef = React.createRef();

    render(
      <Form ref={formRef}>
        <Form.Item>
          <StaticInput />
        </Form.Item>
        <Form.Item name="light">
          <DynamicInput />
        </Form.Item>
      </Form>,
    );

    expect(shouldNotRender).toHaveBeenCalledTimes(2);
    expect(shouldRender).toHaveBeenCalledTimes(2);

    formRef.current.setFieldsValue({ light: 'bamboo' });
    await Promise.resolve();

    expect(shouldNotRender).toHaveBeenCalledTimes(2);
    expect(shouldRender).toHaveBeenCalledTimes(5);
  });

  it('Form.Item with `help` should display error style when validate failed', async () => {
    const { container } = render(
      <Form>
        <Form.Item
          name="test"
          label="test"
          help="help"
          initialValue="bamboo"
          rules={[{ required: true, message: 'message' }]}
        >
          <Input />
        </Form.Item>
      </Form>,
    );

    await userEvent.type(screen.getByLabelText('test'), 'test');
    await userEvent.clear(screen.getByLabelText('test'));

    // should have alert with help text and form item with style
    expect(screen.getByRole('alert')).toHaveTextContent('help');
    expect(container.querySelector('.ant-form-item')).toHaveClass('ant-form-item-has-error');
  });

  it('should clear validation message when input something', async () => {
    render(
      <Form>
        <Form.Item name="test" label="test" rules={[{ required: true, message: 'message' }]}>
          <Input />
        </Form.Item>
      </Form>,
    );

    await userEvent.type(screen.getByLabelText('test'), 'test');

    // should not show alert when field have value
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    await userEvent.clear(screen.getByLabelText('test'));
    await sleep(800);

    // should show alert when field value clear
    expect(screen.getByRole('alert')).toBeInTheDocument();

    await userEvent.type(screen.getByLabelText('test'), 'test');
    await sleep(800);

    // should not show alert when type something in field again
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // https://github.com/ant-design/ant-design/issues/21167
  it('`require` without `name`', () => {
    render(
      <Form.Item label="test" name="test" required>
        <input />
      </Form.Item>,
    );

    expect(screen.getByTitle('test')).toHaveClass('ant-form-item-required');
  });

  it('0 is a validate Field', () => {
    render(
      <Form.Item name={0} label="0">
        <input />
      </Form.Item>,
    );

    // if getByLabelText can get element, then it is a validate field with form control and label
    expect(screen.getByLabelText('0')).toBeInTheDocument();
  });

  it('`null` triggers warning and is treated as `undefined`', () => {
    render(
      <Form.Item name={null} label="test">
        <input />
      </Form.Item>,
    );

    // if getByLabelText can get element, then it is a validate field with form control and label
    expect(screen.queryByLabelText('test')).not.toBeInTheDocument();
    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: [antd: Form.Item] `null` is passed as `name` property',
    );
  });

  // https://github.com/ant-design/ant-design/issues/21415
  it('should not throw error when Component.props.onChange is null', () => {
    // eslint-disable-next-line react/prefer-stateless-function
    class CustomComponent extends Component {
      static defaultProps = {
        onChange: null,
      };

      render() {
        return <input {...this.props} />;
      }
    }

    render(
      <Form>
        <Form.Item name="custom">
          <CustomComponent />
        </Form.Item>
      </Form>,
    );

    expect(async () => {
      await userEvent.type(screen.getByRole('textbox'), 'aaa');
    }).not.toThrow();
  });

  it('change `help` should not warning', async () => {
    const Demo = () => {
      const [error, setError] = React.useState(null);

      return (
        <Form>
          <Form.Item
            help={error ? 'This is an error msg' : undefined}
            validateStatus={error ? 'error' : ''}
            label="Username"
            name="username"
          >
            <input />
          </Form.Item>

          <Form.Item>
            <button type="button" onClick={() => setError(!error)}>
              Trigger
            </button>
          </Form.Item>
        </Form>
      );
    };

    render(<Demo />);
    await userEvent.click(screen.getByRole('button'));

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('`label` support template', async () => {
    render(
      // eslint-disable-next-line no-template-curly-in-string
      <Form validateMessages={{ required: '${label} is good!' }}>
        <Form.Item name="test" label="Bamboo" rules={[{ required: true }]}>
          <input />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('alert')).toHaveTextContent('Bamboo is good!');
  });

  // https://github.com/ant-design/ant-design/issues/33691
  it('should keep upper locale in nested ConfigProvider', async () => {
    render(
      <ConfigProvider locale={zhCN}>
        <ConfigProvider>
          <Form>
            <Form.Item name="test" label="Bamboo" rules={[{ required: true }]}>
              <input />
            </Form.Item>
            <Form.Item>
              <Button htmlType="submit">Submit</Button>
            </Form.Item>
          </Form>
        </ConfigProvider>
      </ConfigProvider>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('alert')).toHaveTextContent('请输入Bamboo');
  });

  it('`name` support template when label is not provided', async () => {
    render(
      // eslint-disable-next-line no-template-curly-in-string
      <Form validateMessages={{ required: '${label} is good!' }}>
        <Form.Item name="Bamboo" rules={[{ required: true }]}>
          <input />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('alert')).toHaveTextContent('Bamboo is good!');
  });

  it('`messageVariables` support validate', async () => {
    render(
      // eslint-disable-next-line no-template-curly-in-string
      <Form validateMessages={{ required: '${label} is good!' }}>
        <Form.Item name="test" messageVariables={{ label: 'Bamboo' }} rules={[{ required: true }]}>
          <input />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('alert')).toHaveTextContent('Bamboo is good!');
  });

  it('validation message should has alert role', async () => {
    // https://github.com/ant-design/ant-design/issues/25711
    render(
      // eslint-disable-next-line no-template-curly-in-string
      <Form validateMessages={{ required: 'name is good!' }}>
        <Form.Item name="test" rules={[{ required: true }]}>
          <input />
        </Form.Item>
        <Form.Item>
          <Button htmlType="submit">Submit</Button>
        </Form.Item>
      </Form>,
    );

    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByRole('alert')).toHaveTextContent('name is good!');
  });

  it('return same form instance', async () => {
    const instances = new Set();

    const App = () => {
      const [form] = Form.useForm();
      instances.add(form);
      const [, forceUpdate] = React.useState({});
      return (
        <button
          type="button"
          onClick={() => {
            forceUpdate({});
          }}
        >
          Refresh
        </button>
      );
    };

    render(<App />);

    for (let i = 0; i < 5; i += 1) {
      // eslint-disable-next-line no-await-in-loop
      await userEvent.click(screen.getByRole('button'));
    }

    // it didn't re render when user click button, but rtl will render it twice(not sure why)
    expect(instances.size).toBe(2);
  });

  it('should avoid re-render', async () => {
    const mockRenderFunction = jest.fn();

    const MyInput = ({ value = '', ...props }) => {
      mockRenderFunction();
      return <input value={value} {...props} />;
    };

    const Demo = () => (
      <Form>
        <Form.Item name="username" label="username" rules={[{ required: true }]}>
          <MyInput />
        </Form.Item>
      </Form>
    );

    render(<Demo />);
    jest.clearAllMocks();

    fireEvent.change(screen.getByLabelText('username'), {
      target: {
        value: 'a',
      },
    });

    expect(mockRenderFunction).toBeCalledTimes(2);

    screen.debug();
    expect(screen.getByLabelText('username')).toHaveValue('a');
  });

  it('should warning with `defaultValue`', () => {
    render(
      <Form>
        <Form.Item name="light">
          <input defaultValue="should warning" />
        </Form.Item>
      </Form>,
    );

    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: [antd: Form.Item] `defaultValue` will not work on controlled Field. You should use `initialValues` of Form instead.',
    );
  });

  it('should remove Field and also reset error', async () => {
    const Demo = ({ showA }) => (
      <Form>
        {showA ? (
          <Form.Item name="a" help="error">
            <input />
          </Form.Item>
        ) : (
          <Form.Item name="b">
            <input />
          </Form.Item>
        )}
      </Form>
    );

    const { rerender } = render(<Demo showA />);

    expect(screen.getByRole('alert')).toBeInTheDocument();

    rerender(<Demo showA={false} />);

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('no warning of initialValue & getValueProps & preserve', () => {
    render(
      <Form>
        <Form.Item initialValue="bamboo" getValueProps={() => null} preserve={false}>
          <Input />
        </Form.Item>
      </Form>,
    );
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('should customize id when pass with id', () => {
    render(
      <Form>
        <Form.Item name="light">
          <Input id="bamboo" />
        </Form.Item>
      </Form>,
    );

    expect(screen.getByRole('textbox')).toHaveAttribute('id', 'bamboo');
  });

  it('should trigger validate when onBlur when pass validateTrigger onBlur', async () => {
    render(
      <Form validateTrigger="onBlur">
        <Form.Item name="light" label="light" rules={[{ len: 3 }]}>
          <Input />
        </Form.Item>
      </Form>,
    );

    // type a invalidate value, not trigger validation
    await userEvent.type(screen.getByRole('textbox'), '7777');

    expect(screen.queryByRole('alert')).not.toBeInTheDocument();

    // tab(onBlur) the input field, trigger and see the alert
    await userEvent.tab(screen.getByRole('textbox'));

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  describe('Form item hidden', () => {
    it('should hide when pass hidden prop', () => {
      const { container } = render(
        <Form>
          <Form.Item name="light" hidden>
            <Input />
          </Form.Item>
        </Form>,
      );
      expect(container).toMatchSnapshot();
    });

    it('noStyle should not work when hidden', () => {
      const { container } = render(
        <Form>
          <Form.Item name="light" hidden noStyle>
            <Input />
          </Form.Item>
        </Form>,
      );
      expect(container).toMatchSnapshot();
    });
  });

  it('legacy hideRequiredMark', () => {
    render(
      // todo: form should have form role by default
      <Form hideRequiredMark role="form">
        <Form.Item name="light" label="light" required>
          <Input />
        </Form.Item>
      </Form>,
    );

    expect(screen.getByRole('form')).toHaveClass('ant-form-hide-required-mark');
  });

  it('form should support disabled', () => {
    const App = () => (
      <Form labelCol={{ span: 4 }} wrapperCol={{ span: 14 }} layout="horizontal" disabled>
        <Form.Item label="Form disabled" name="disabled" valuePropName="checked">
          <Checkbox>disabled</Checkbox>
        </Form.Item>
        <Form.Item label="Radio">
          <Radio.Group>
            <Radio value="apple"> Apple </Radio>
            <Radio value="pear"> Pear </Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item label="Input">
          <Input />
        </Form.Item>
        <Form.Item label="Select">
          <Select>
            <Select.Option value="demo">Demo</Select.Option>
          </Select>
        </Form.Item>
        <Form.Item label="TreeSelect">
          <TreeSelect
            treeData={[
              {
                title: 'Light',
                value: 'light',
                children: [{ title: 'Bamboo', value: 'bamboo' }],
              },
            ]}
          />
        </Form.Item>
        <Form.Item label="Cascader">
          <Cascader
            options={[
              {
                value: 'zhejiang',
                label: 'Zhejiang',
                children: [
                  {
                    value: 'hangzhou',
                    label: 'Hangzhou',
                  },
                ],
              },
            ]}
          />
        </Form.Item>
        <Form.Item label="DatePicker">
          <DatePicker />
        </Form.Item>
        <Form.Item label="RangePicker">
          <RangePicker />
        </Form.Item>
        <Form.Item label="InputNumber">
          <InputNumber />
        </Form.Item>
        <Form.Item label="TextArea">
          <TextArea rows={4} />
        </Form.Item>
        <Form.Item label="Switch" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item label="Upload" valuePropName="fileList">
          <Upload />
        </Form.Item>
        <Form.Item label="Button">
          <Button>Button</Button>
        </Form.Item>
      </Form>
    );

    const { container } = render(<App />);

    expect(container).toMatchSnapshot();
  });

  it.only('_internalItemRender api test', () => {
    render(
      <Form>
        <Form.Item
          name="light"
          _internalItemRender={{
            mark: 'pro_table_render',
            render: (_, doms) => (
              <div>
                <h1>warning title</h1>
                {doms.input}
                {doms.errorList}
                {doms.extra}
              </div>
            ),
          }}
        >
          <input defaultValue="should warning" />
        </Form.Item>
      </Form>,
    );

    expect(screen.getByRole('heading')).toHaveTextContent(/warning title/i);
  });

  it('Form Item element id will auto add form_item prefix if form name is empty and item name is in the black list', async () => {
    const mockFn = jest.spyOn(Util, 'getFieldId');
    const itemName = 'parentNode';
    // mock getFieldId old logic,if form name is empty ,and item name is parentNode,will get parentNode
    mockFn.mockImplementation(() => itemName);
    const { Option } = Select;
    const Demo = () => {
      const [open, setOpen] = useState(false);
      return (
        <>
          <Form>
            <Form.Item name={itemName}>
              <Select
                className="form_item_parentNode"
                defaultValue="lucy"
                open={open}
                style={{ width: 120 }}
              >
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="Yiminghe">yiminghe</Option>
              </Select>
            </Form.Item>
          </Form>
          <button
            type="button"
            onClick={() => {
              setOpen(true);
            }}
          >
            {open ? 'show' : 'hidden'}
          </button>
        </>
      );
    };

    const wrapper = mount(<Demo />, { attachTo: document.body });
    expect(mockFn).toHaveBeenCalled();
    expect(Util.getFieldId()).toBe(itemName);

    // make sure input id is parentNode
    expect(wrapper.find(`#${itemName}`).exists()).toBeTruthy();
    act(() => {
      wrapper.find('button').simulate('click');
    });
    expect(wrapper.find('button').text()).toBe('show');

    mockFn.mockRestore();
    // https://enzymejs.github.io/enzyme/docs/api/ShallowWrapper/update.html
    // setProps instead of update
    wrapper.setProps({});
    expect(wrapper.find(`#form_item_${itemName}`).exists()).toBeTruthy();
    wrapper.unmount();
  });

  describe('tooltip', () => {
    it('ReactNode', () => {
      const wrapper = mount(
        <Form>
          <Form.Item label="light" tooltip={<span>Bamboo</span>}>
            <Input />
          </Form.Item>
        </Form>,
      );

      const tooltipProps = wrapper.find('Tooltip').props();
      expect(tooltipProps.title).toEqual(<span>Bamboo</span>);
    });

    it('config', () => {
      const wrapper = mount(
        <Form>
          <Form.Item label="light" tooltip={{ title: 'Bamboo' }}>
            <Input />
          </Form.Item>
        </Form>,
      );

      const tooltipProps = wrapper.find('Tooltip').props();
      expect(tooltipProps.title).toEqual('Bamboo');
    });
  });

  it('warningOnly validate', async () => {
    jest.useFakeTimers();

    const { container } = render(
      <Form>
        <Form.Item>
          <Form.Item
            name="test"
            initialValue="bamboo"
            rules={[{ required: true, warningOnly: true }]}
          >
            <Input />
          </Form.Item>
        </Form.Item>
      </Form>,
    );

    await change(container, 0, '', true);
    expect(container.querySelectorAll('.ant-form-item-with-help').length).toBeTruthy();
    expect(container.querySelectorAll('.ant-form-item-has-warning').length).toBeTruthy();

    jest.useRealTimers();
  });

  it('not warning when remove on validate', async () => {
    jest.useFakeTimers();
    let rejectFn = null;

    const { container, unmount } = render(
      <Form>
        <Form.Item>
          <Form.Item
            noStyle
            name="test"
            initialValue="bamboo"
            rules={[
              {
                validator: () =>
                  new Promise((_, reject) => {
                    rejectFn = reject;
                  }),
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form.Item>
      </Form>,
    );

    await change(container, 0, '', true);

    unmount();

    // Delay validate failed
    rejectFn(new Error('delay failed'));

    expect(errorSpy).not.toHaveBeenCalled();

    jest.useRealTimers();
  });

  describe('form colon', () => {
    it('default colon', () => {
      const wrapper = mount(
        <Form>
          <Form.Item label="姓名">
            <input />
          </Form.Item>
        </Form>,
      );

      expect(wrapper.exists('.ant-form-item-no-colon')).toBeFalsy();
    });

    it('set Form.Item colon false', () => {
      const wrapper = mount(
        <Form colon>
          <Form.Item colon={false} label="姓名">
            <Input />
          </Form.Item>
        </Form>,
      );

      expect(wrapper.find('.ant-form-item-no-colon')).toBeTruthy();
    });

    it('set Form colon false', () => {
      const wrapper = mount(
        <Form colon={false}>
          <Form.Item label="姓名">
            <Input />
          </Form.Item>
        </Form>,
      );

      expect(wrapper.find('.ant-form-item-no-colon')).toBeTruthy();
    });
  });

  it('useFormInstance', () => {
    let formInstance;
    let subFormInstance;

    const Sub = () => {
      const formSub = Form.useFormInstance();
      subFormInstance = formSub;

      return null;
    };

    const Demo = () => {
      const [form] = Form.useForm();
      formInstance = form;

      return (
        <Form form={form}>
          <Sub />
        </Form>
      );
    };

    render(<Demo />);
    expect(subFormInstance).toBe(formInstance);
  });

  it('noStyle should not affect status', () => {
    const Demo = () => (
      <Form>
        <Form.Item validateStatus="error" noStyle>
          <Select className="custom-select" />
        </Form.Item>
        <Form.Item validateStatus="error">
          <Form.Item noStyle>
            <Select className="custom-select-b" />
          </Form.Item>
        </Form.Item>
        <Form.Item validateStatus="error">
          <Form.Item noStyle validateStatus="warning">
            <Select className="custom-select-c" />
          </Form.Item>
        </Form.Item>
        <Form.Item noStyle>
          <Form.Item validateStatus="warning">
            <Select className="custom-select-d" />
          </Form.Item>
        </Form.Item>
      </Form>
    );
    const { container } = render(<Demo />);
    expect(container.querySelector('.custom-select')?.className).not.toContain('status-error');
    expect(container.querySelector('.custom-select')?.className).not.toContain('in-form-item');
    expect(container.querySelector('.custom-select-b')?.className).toContain('status-error');
    expect(container.querySelector('.custom-select-b')?.className).toContain('in-form-item');
    expect(container.querySelector('.custom-select-c')?.className).toContain('status-error');
    expect(container.querySelector('.custom-select-c')?.className).toContain('in-form-item');
    expect(container.querySelector('.custom-select-d')?.className).toContain('status-warning');
    expect(container.querySelector('.custom-select-d')?.className).toContain('in-form-item');
  });

  it('should not affect Popup children style', () => {
    const Demo = () => (
      <Form>
        <Form.Item labelCol={4} validateStatus="error">
          <Modal visible>
            <Select className="modal-select" />
          </Modal>
        </Form.Item>
        <Form.Item validateStatus="error">
          <Drawer visible>
            <Select className="drawer-select" />
          </Drawer>
        </Form.Item>
      </Form>
    );
    const { container } = render(<Demo />, { container: document.body });
    expect(container.querySelector('.modal-select')?.className).not.toContain('in-form-item');
    expect(container.querySelector('.modal-select')?.className).not.toContain('status-error');
    expect(container.querySelector('.drawer-select')?.className).not.toContain('in-form-item');
    expect(container.querySelector('.drawer-select')?.className).not.toContain('status-error');
  });

  it('Form.Item.useStatus should work', async () => {
    const {
      Item: { useStatus },
    } = Form;

    const CustomInput = ({ className, value }) => {
      const { status } = useStatus();
      return <div className={classNames(className, `custom-input-status-${status}`)}>{value}</div>;
    };

    const Demo = () => {
      const [form] = Form.useForm();

      return (
        <Form form={form} name="my-form">
          <Form.Item name="required" rules={[{ required: true }]}>
            <CustomInput className="custom-input-required" value="" />
          </Form.Item>
          <Form.Item name="warning" validateStatus="warning">
            <CustomInput className="custom-input-warning" />
          </Form.Item>
          <Form.Item name="normal">
            <CustomInput className="custom-input" />
          </Form.Item>
          <CustomInput className="custom-input-wrong" />
          <Button onClick={() => form.submit()} className="submit-button">
            Submit
          </Button>
        </Form>
      );
    };

    const { container } = render(<Demo />);

    expect(container.querySelector('.custom-input-required')?.classList).toContain(
      'custom-input-status-',
    );
    expect(container.querySelector('.custom-input-warning')?.classList).toContain(
      'custom-input-status-warning',
    );
    expect(container.querySelector('.custom-input')?.classList).toContain('custom-input-status-');
    expect(container.querySelector('.custom-input-wrong')?.classList).toContain(
      'custom-input-status-undefined',
    );
    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('Form.Item.useStatus should be used under Form.Item component.'),
    );
    fireEvent.click(container.querySelector('.submit-button'));
    await sleep(0);
    expect(container.querySelector('.custom-input-required')?.classList).toContain(
      'custom-input-status-error',
    );
  });

  it('item customize margin', async () => {
    const computeSpy = jest.spyOn(window, 'getComputedStyle').mockImplementation(() => ({
      marginBottom: 24,
    }));

    const { container } = render(
      <Form>
        <Form.Item name="required" initialValue="bamboo" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
      </Form>,
    );

    fireEvent.change(container.querySelector('input'), {
      target: {
        value: '',
      },
    });

    await sleep(0);
    computeSpy.mockRestore();

    expect(container.querySelector('.ant-form-item-margin-offset')).toHaveStyle({
      marginBottom: -24,
    });
  });
});
