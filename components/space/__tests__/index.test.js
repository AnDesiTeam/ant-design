import React, { useState } from 'react';
import { render, mount } from 'enzyme';
import { act } from 'react-test-renderer';
import { useMediaQuery } from 'react-responsive';
import Space from '..';
import ConfigProvider from '../../config-provider';
import mountTest from '../../../tests/shared/mountTest';

jest.mock('react-responsive');

describe('Space', () => {
  mountTest(Space);

  it('should render width empty children', () => {
    const wrapper = mount(<Space />);

    expect(wrapper.instance()).toBe(null);
  });

  it('should render width ConfigProvider', () => {
    const wrapper = mount(
      <ConfigProvider space={{ size: 'large' }}>
        <Space>
          <span>1</span>
          <span>2</span>
        </Space>
        <Space size="middle">
          <span>1</span>
          <span>2</span>
        </Space>
        <Space size="large">
          <span>1</span>
          <span>2</span>
        </Space>
      </ConfigProvider>,
    );

    expect(render(wrapper)).toMatchSnapshot();
  });

  it('should render width customize size', () => {
    const wrapper = mount(
      <Space size={10}>
        <span>1</span>
        <span>2</span>
      </Space>,
    );

    expect(wrapper.find('div.ant-space-item').at(0).prop('style').marginRight).toBe(10);
    expect(wrapper.find('div.ant-space-item').at(1).prop('style').marginRight).toBeUndefined();
  });

  it('should render vertical space width customize size', () => {
    const wrapper = mount(
      <Space size={10} direction="vertical">
        <span>1</span>
        <span>2</span>
      </Space>,
    );

    expect(wrapper.find('div.ant-space-item').at(0).prop('style').marginBottom).toBe(10);
    expect(wrapper.find('div.ant-space-item').at(1).prop('style').marginBottom).toBeUndefined();
  });

  it('should render correct with children', () => {
    const wrapper = mount(
      <Space>
        text1<span>text1</span>
        <>text3</>
      </Space>,
    );

    expect(render(wrapper)).toMatchSnapshot();
  });

  it('should render with invalidElement', () => {
    const wrapper = mount(
      <Space>
        text1<span>text1</span>
        text1
      </Space>,
    );

    expect(wrapper.find('div.ant-space-item').length).toBe(3);
  });

  it('should be keep store', () => {
    function Demo() {
      const [state, setState] = React.useState(1);

      return (
        <div
          id="demo"
          onClick={() => {
            setState(value => value + 1);
          }}
        >
          {state}
        </div>
      );
    }
    function SpaceDemo() {
      const [visible, setVisible] = useState(true);
      function onChange() {
        setVisible(!visible);
      }
      return (
        <Space>
          {visible && <div>space</div>}
          <Demo />
          <p onClick={onChange}>Three</p>
        </Space>
      );
    }
    const wrapper = mount(<SpaceDemo />);

    expect(wrapper.find('#demo').text()).toBe('1');

    act(() => {
      wrapper.find('#demo').simulate('click');
    });

    expect(wrapper.find('#demo').text()).toBe('2');

    act(() => {
      wrapper.find('p').simulate('click');
    });

    expect(wrapper.find('#demo').text()).toBe('2');
  });

  describe('when responsive is set', () => {
    describe('and screen size matches', () => {
      beforeEach(() => {
        useMediaQuery.mockImplementation(() => true);
      });

      it('should inverse direction', () => {
        const wrapper = mount(
          <Space responsiveFrom="xs" size={10}>
            <span>1</span>
            <span>2</span>
          </Space>,
        );

        expect(wrapper.find('.ant-space').hasClass('ant-space-responsive')).toBeTruthy();
        expect(wrapper.find('div.ant-space-item').at(0).prop('style').marginBottom).toBe(10);
        expect(wrapper.find('div.ant-space-item').at(1).prop('style').marginRight).toBeUndefined();
      });
    });

    describe('and screen size does not match', () => {
      beforeEach(() => {
        useMediaQuery.mockImplementation(() => false);
      });

      it('should keep direction', () => {
        const wrapper = mount(
          <Space responsiveFrom="sm" size={10}>
            <span>1</span>
            <span>2</span>
          </Space>,
        );

        expect(wrapper.find('.ant-space').hasClass('ant-space-responsive')).toBeFalsy();
        expect(wrapper.find('div.ant-space-item').at(0).prop('style').marginRight).toBe(10);
        expect(wrapper.find('div.ant-space-item').at(1).prop('style').marginRight).toBeUndefined();
      });
    });
  });
});
