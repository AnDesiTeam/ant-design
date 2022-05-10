import * as React from 'react';
import classNames from 'classnames';
import useMergedState from 'rc-util/lib/hooks/useMergedState';
import Radio from './radio';
import type { RadioGroupProps, RadioChangeEvent, RadioGroupButtonStyle } from './interface';
import { ConfigContext } from '../config-provider';
import SizeContext from '../config-provider/SizeContext';
import { RadioGroupContextProvider } from './context';
import getDataOrAriaProps from '../_util/getDataOrAriaProps';
import useStyle from './style';

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>((props, ref) => {
  const { getPrefixCls, direction } = React.useContext(ConfigContext);
  const size = React.useContext(SizeContext);

  const [value, setValue] = useMergedState(props.defaultValue, {
    value: props.value,
  });

  const { prefixCls: customizePrefixCls } = props;
  const prefixCls = getPrefixCls('radio', customizePrefixCls);
  const groupPrefixCls = `${prefixCls}-group`;

  // Style
  const [wrapSSR, hashId] = useStyle(prefixCls, getPrefixCls());

  const onRadioChange = (ev: RadioChangeEvent) => {
    const lastValue = value;
    const val = ev.target.value;
    if (!('value' in props)) {
      setValue(val);
    }
    const { onChange } = props;
    if (onChange && val !== lastValue) {
      onChange(ev);
    }
  };

  const renderGroup = () => {
    const {
      className = '',
      options,
      buttonStyle = 'outline' as RadioGroupButtonStyle,
      disabled,
      children,
      size: customizeSize,
      style,
      id,
      onMouseEnter,
      onMouseLeave,
    } = props;
    let childrenToRender = children;
    // 如果存在 options, 优先使用
    if (options && options.length > 0) {
      childrenToRender = options.map(option => {
        if (typeof option === 'string' || typeof option === 'number') {
          // 此处类型自动推导为 string
          return (
            <Radio
              key={option.toString()}
              prefixCls={prefixCls}
              disabled={disabled}
              value={option}
              checked={value === option}
            >
              {option}
            </Radio>
          );
        }
        // 此处类型自动推导为 { label: string value: string }
        return (
          <Radio
            key={`radio-group-value-options-${option.value}`}
            prefixCls={prefixCls}
            disabled={option.disabled || disabled}
            value={option.value}
            checked={value === option.value}
            style={option.style}
          >
            {option.label}
          </Radio>
        );
      });
    }

    const mergedSize = customizeSize || size;
    const classString = classNames(
      groupPrefixCls,
      `${groupPrefixCls}-${buttonStyle}`,
      {
        [`${groupPrefixCls}-${mergedSize}`]: mergedSize,
        [`${groupPrefixCls}-rtl`]: direction === 'rtl',
      },
      className,
      hashId,
    );
    return wrapSSR(
      <div
        {...getDataOrAriaProps(props)}
        className={classString}
        style={style}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        id={id}
        ref={ref}
      >
        {childrenToRender}
      </div>,
    );
  };

  return (
    <RadioGroupContextProvider
      value={{
        onChange: onRadioChange,
        value,
        disabled: props.disabled,
        name: props.name,
        optionType: props.optionType,
      }}
    >
      {renderGroup()}
    </RadioGroupContextProvider>
  );
});

export default React.memo(RadioGroup);
