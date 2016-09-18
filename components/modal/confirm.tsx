import * as React from 'react';
import * as ReactDOM from 'react-dom';
import Dialog from './Modal';
import Icon from '../icon';
import Button from '../button';
import classNames from 'classnames';
import { getConfirmLocale } from './locale';
import assign from 'object-assign';

export interface ActionButtonProps {
  type: 'primary' | 'ghost' | 'dashed';
  actionFn: Function;
  closeModal: Function;
  hotkey: Number;
}
class ActionButton extends React.Component<ActionButtonProps, any> {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
    };
  }
  hotkeyHandler = e => {
    if (e.keyCode === this.props.hotkey) {
      this.onClick();
    }
  }
  componentDidMount () {
    document.addEventListener('keypress', this.hotkeyHandler);
  }
  componentWillUnmount () {
    document.removeEventListener('keypress', this.hotkeyHandler);
  }
  onClick = () => {
    const { actionFn, closeModal } = this.props;
    if (actionFn) {
      let ret;
      if (actionFn.length) {
        ret = actionFn(closeModal);
      } else {
        ret = actionFn();
        if (!ret) {
          closeModal();
        }
      }
      if (ret && ret.then) {
        this.setState({ loading: true });
        ret.then((...args) => {
          // It's unnecessary to set loading=false, for the Modal will be unmounted after close.
          // this.setState({ loading: false });
          closeModal(...args);
        });
      }
    } else {
      closeModal();
    }
  }

  render() {
    const { type, children } = this.props;
    const loading = this.state.loading;
    return (
      <Button type={type} size="large" onClick={this.onClick} loading={loading}>
        {children}
      </Button>
    );
  }
}

export default function confirm(config) {
  const props = assign({ iconType: 'question-circle' }, config);
  const prefixCls = props.prefixCls || 'ant-confirm';
  let div = document.createElement('div');
  document.body.appendChild(div);

  let width = props.width || 416;
  let style = props.style || {};

  // 默认为 true，保持向下兼容
  if (!('okCancel' in props)) {
    props.okCancel = true;
  }

  const runtimeLocale = getConfirmLocale();

  props.okText = props.okText ||
    (props.okCancel ? runtimeLocale.okText : runtimeLocale.justOkText);
  props.cancelText = props.cancelText || runtimeLocale.cancelText;

  function close() {
    const unmountResult = ReactDOM.unmountComponentAtNode(div);
    if (unmountResult) {
      div.parentNode.removeChild(div);
    }
  }

  let body = (
    <div className={`${prefixCls}-body`}>
      <Icon type={props.iconType} />
      <span className={`${prefixCls}-title`}>{props.title}</span>
      <div className={`${prefixCls}-content`}>{props.content}</div>
    </div>
  );

  let footer = null;
  if (props.okCancel) {
    footer = (
      <div className={`${prefixCls}-btns`}>
        <ActionButton type="ghost" actionFn={props.onCancel} closeModal={close} hotkey={27}>
          {props.cancelText}
        </ActionButton>
        <ActionButton type="primary" actionFn={props.onOk} closeModal={close} hotkey={13}>
          {props.okText}
        </ActionButton>
      </div>
    );
  } else {
    footer = (
      <div className={`${prefixCls}-btns`}>
        <ActionButton type="primary" actionFn={props.onOk} closeModal={close} hotkey={13}>
          {props.okText}
        </ActionButton>
      </div>
    );
  }

  const classString = classNames({
    [prefixCls]: true,
    [`${prefixCls}-${props.type}`]: true,
    [props.className]: !!props.className,
  });

  ReactDOM.render(
    <Dialog
      className={classString}
      visible
      closable={false}
      title=""
      transitionName="zoom"
      footer=""
      maskTransitionName="fade"
      style={style}
      width={width}
    >
      <div style={{ zoom: 1, overflow: 'hidden' }}>{body} {footer}</div>
    </Dialog>
  , div);

  return {
    destroy: close,
  };
}
