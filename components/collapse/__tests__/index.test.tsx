import React from 'react';
import { act } from 'react-dom/test-utils';
import { vi } from 'vitest';
import { fireEvent, render, waitFakeTimer } from '../../../tests/utils';
import { resetWarned } from '../../_util/warning';
import Collapse from '../Collapse';

describe('Collapse', () => {
  const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

  // fix React concurrent
  function triggerAllTimer() {
    for (let i = 0; i < 10; i += 1) {
      act(() => {
        vi.runAllTimers();
      });
    }
  }

  beforeEach(() => {
    resetWarned();
  });

  afterEach(() => {
    errorSpy.mockReset();
  });

  afterAll(() => {
    errorSpy.mockRestore();
  });

  it('should support remove expandIcon', () => {
    const { asFragment } = render(
      <Collapse expandIcon={() => null}>
        <Collapse.Panel key={1} header="header" />
      </Collapse>,
    );
    expect(asFragment().firstChild).toMatchSnapshot();
  });

  it('should be able to config size', () => {
    const { container: small } = render(<Collapse size="small" />);
    const { container: large } = render(<Collapse size="large" />);

    expect(small.querySelector('.ant-collapse')).toHaveClass('ant-collapse-small');
    expect(large.querySelector('.ant-collapse')).toHaveClass('ant-collapse-large');
  });

  it('should keep the className of the expandIcon', () => {
    const { container } = render(
      <Collapse
        expandIcon={() => (
          <button type="button" className="custom-expandicon-classname">
            action
          </button>
        )}
      >
        <Collapse.Panel key={1} header="header" />
      </Collapse>,
    );

    expect(container.querySelectorAll('.custom-expandicon-classname').length).toBe(1);
  });

  it('should render extra node of panel', () => {
    const { asFragment } = render(
      <Collapse>
        <Collapse.Panel header="header" key={1} extra={<button type="button">action</button>} />
        <Collapse.Panel header="header" key={2} extra={<button type="button">action</button>} />
      </Collapse>,
    );
    expect(asFragment().firstChild).toMatchSnapshot();
  });

  it('could be expand and collapse', async () => {
    vi.useFakeTimers();
    const { container } = render(
      <Collapse>
        <Collapse.Panel header="This is panel header 1" key="1">
          content
        </Collapse.Panel>
      </Collapse>,
    );
    expect(
      container.querySelector('.ant-collapse-item')?.classList.contains('ant-collapse-item-active'),
    ).toBe(false);
    fireEvent.click(container.querySelector('.ant-collapse-header')!);
    await waitFakeTimer();
    expect(
      container.querySelector('.ant-collapse-item')?.classList.contains('ant-collapse-item-active'),
    ).toBe(true);
    vi.useRealTimers();
  });

  it('could override default openMotion', () => {
    const props = { openMotion: {} };
    const { container, asFragment } = render(
      <Collapse {...props}>
        <Collapse.Panel header="This is panel header 1" key="1">
          content
        </Collapse.Panel>
      </Collapse>,
    );
    fireEvent.click(container.querySelector('.ant-collapse-header')!);
    expect(asFragment().firstChild).toMatchSnapshot();
  });

  it('should trigger warning and keep compatibility when using disabled in Panel', () => {
    const { container } = render(
      <Collapse>
        <Collapse.Panel disabled header="This is panel header 1" key="1">
          content
        </Collapse.Panel>
      </Collapse>,
    );

    expect(errorSpy).toHaveBeenCalledWith(
      'Warning: [antd: Collapse.Panel] `disabled` is deprecated. Please use `collapsible="disabled"` instead.',
    );

    expect(container.querySelectorAll('.ant-collapse-item-disabled').length).toBe(1);

    fireEvent.click(container.querySelector('.ant-collapse-header')!);
    expect(container.querySelectorAll('.ant-collapse-item-active').length).toBe(0);
  });

  it('should end motion when set activeKey while hiding', async () => {
    vi.useFakeTimers();
    const spiedRAF = vi
      .spyOn(window, 'requestAnimationFrame')
      .mockImplementation((cb) => setTimeout(cb, 16.66));

    let setActiveKeyOuter: React.Dispatch<React.SetStateAction<React.Key>>;
    const Test: React.FC = () => {
      const [activeKey, setActiveKey] = React.useState<React.Key>();
      setActiveKeyOuter = setActiveKey;
      return (
        <div hidden>
          <Collapse activeKey={activeKey}>
            <Collapse.Panel header="header" key="1">
              content
            </Collapse.Panel>
          </Collapse>
        </div>
      );
    };

    const { container } = render(<Test />);

    await act(async () => {
      setActiveKeyOuter('1');
      await Promise.resolve();
    });

    triggerAllTimer();

    expect(container.querySelectorAll('.ant-motion-collapse').length).toBe(0);

    spiedRAF.mockRestore();
    vi.useRealTimers();
  });

  it('ref should work', () => {
    const ref = React.createRef<HTMLDivElement>();
    const panelRef1 = React.createRef<HTMLDivElement>();
    const panelRef2 = React.createRef<HTMLDivElement>();

    const { container } = render(
      <Collapse ref={ref}>
        <Collapse.Panel ref={panelRef1} header="panel header 1" key="1">
          1
        </Collapse.Panel>
        <Collapse.Panel ref={panelRef2} header="panel header 2" key="2">
          2
        </Collapse.Panel>
        <Collapse.Panel header="panel header 3" key="3">
          2
        </Collapse.Panel>
      </Collapse>,
    );

    expect(ref.current).toBe(container.firstChild);
    expect(panelRef1.current).toBe(document.querySelectorAll('.ant-collapse-item')[0]);
    expect(panelRef2.current).toBe(document.querySelectorAll('.ant-collapse-item')[1]);
  });

  describe('expandIconPosition', () => {
    it.each(['left', 'right'] as const)(`warning for legacy %s'`, (pos) => {
      render(
        <Collapse expandIconPosition={pos}>
          <Collapse.Panel header="header" key="1" />
        </Collapse>,
      );

      expect(errorSpy).toHaveBeenCalledWith(
        'Warning: [antd: Collapse] `expandIconPosition` with `left` or `right` is deprecated. Please use `start` or `end` instead.',
      );
    });

    it('position end', () => {
      const { container } = render(
        <Collapse expandIconPosition="end">
          <Collapse.Panel header="header" key="1" />
        </Collapse>,
      );

      expect(container.querySelector('.ant-collapse-icon-position-end')).toBeTruthy();
    });
  });
});
