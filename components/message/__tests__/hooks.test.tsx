/* eslint-disable jsx-a11y/control-has-associated-label */
import React from 'react';
import { act } from 'react-dom/test-utils';
import message from '..';
import ConfigProvider from '../../config-provider';
import { render, fireEvent } from '../../../tests/utils';
import { triggerMotionEnd } from './util';

describe('message.hooks', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should work', () => {
    const Context = React.createContext('light');

    const Demo = () => {
      const [api, holder] = message.useMessage();

      return (
        <ConfigProvider prefixCls="my-test">
          <Context.Provider value="bamboo">
            <button
              type="button"
              onClick={() => {
                api.open({
                  content: (
                    <Context.Consumer>
                      {name => <span className="hook-test-result">{name}</span>}
                    </Context.Consumer>
                  ),
                  duration: 0,
                });
              }}
            />
            {holder}
          </Context.Provider>
        </ConfigProvider>
      );
    };

    const { container } = render(<Demo />);
    fireEvent.click(container.querySelector('button')!);

    expect(document.querySelectorAll('.my-test-message-notice')).toHaveLength(1);
    expect(document.querySelector('.hook-test-result')!.textContent).toEqual('bamboo');
  });

  it('should work with success', () => {
    const Context = React.createContext('light');

    const Demo = () => {
      const [api, holder] = message.useMessage();

      return (
        <ConfigProvider prefixCls="my-test">
          <Context.Provider value="bamboo">
            <button
              type="button"
              onClick={() => {
                api.success({
                  content: (
                    <Context.Consumer>
                      {name => <span className="hook-test-result">{name}</span>}
                    </Context.Consumer>
                  ),
                  duration: 0,
                });
              }}
            />
            {holder}
          </Context.Provider>
        </ConfigProvider>
      );
    };

    const { container } = render(<Demo />);
    fireEvent.click(container.querySelector('button')!);

    expect(document.querySelectorAll('.my-test-message-notice')).toHaveLength(1);
    expect(document.querySelectorAll('.anticon-check-circle')).toHaveLength(1);
    expect(document.querySelector('.hook-test-result')!.textContent).toEqual('bamboo');
  });

  it('should work with onClose', done => {
    const Demo = () => {
      const [api, holder] = message.useMessage();
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api.open({
                content: 'amazing',
                duration: 1,
                onClose() {
                  done();
                },
              });
            }}
          />
          {holder}
        </>
      );
    };

    const { container } = render(<Demo />);
    fireEvent.click(container.querySelector('button')!);

    triggerMotionEnd();
  });

  it('should work with close promise', done => {
    const Demo = () => {
      const [api, holder] = message.useMessage();
      return (
        <>
          <button
            type="button"
            onClick={() => {
              api
                .open({
                  content: 'good',
                  duration: 1,
                })
                .then(() => {
                  done();
                });
            }}
          />
          {holder}
        </>
      );
    };

    const { container } = render(<Demo />);
    fireEvent.click(container.querySelector('button')!);

    triggerMotionEnd();
  });

  it('should work with hide', async () => {
    let hide: VoidFunction;
    const Demo = () => {
      const [api, holder] = message.useMessage();
      return (
        <ConfigProvider prefixCls="my-test">
          <button
            type="button"
            onClick={() => {
              hide = api.open({
                content: 'nice',
                duration: 0,
              });
            }}
          />
          {holder}
        </ConfigProvider>
      );
    };

    const { container } = render(<Demo />);
    fireEvent.click(container.querySelector('button')!);

    expect(document.querySelectorAll('.my-test-message-notice')).toHaveLength(1);

    act(() => {
      hide!();
    });
    await triggerMotionEnd('.my-test-message-move-up-leave');

    expect(document.querySelectorAll('.my-test-message-notice')).toHaveLength(0);
  });

  it('should be same hook', () => {
    let cacheAPI: any;

    const Demo = () => {
      const [, forceUpdate] = React.useState({});
      const [api] = message.useMessage();

      React.useEffect(() => {
        if (!cacheAPI) {
          cacheAPI = api;
        } else {
          expect(cacheAPI).toBe(api);
        }

        forceUpdate({});
      }, [api]);

      return null;
    };

    render(<Demo />);
  });

  it("should use ConfigProvider's getPopupContainer as message container", () => {
    const containerId = 'container';
    const div = document.createElement('div');
    div.id = containerId;
    document.body.appendChild(div);

    const getPopupContainer = () => div;

    const Demo = () => {
      const [api, holder] = message.useMessage();
      return (
        <ConfigProvider getPopupContainer={getPopupContainer} prefixCls="my-test">
          {holder}
          <button
            type="button"
            onClick={() => {
              api.success({
                content: <span className="hook-content">happy</span>,
                duration: 0,
              });
            }}
          />
        </ConfigProvider>
      );
    };

    const { container } = render(<Demo />);
    fireEvent.click(container.querySelector('button')!);

    expect(div.querySelectorAll('.my-test-message-notice')).toHaveLength(1);
    expect(div.querySelectorAll('.anticon-check-circle')).toHaveLength(1);
    expect(div.querySelector('.hook-content')!.textContent).toEqual('happy');
    expect(document.querySelectorAll(`#${containerId}`)).toHaveLength(1);
  });
});
