import { List } from 'rc-field-form';
import type { StoreValue, ValidatorRule } from 'rc-field-form/lib/interface';
import { getNamePath } from 'rc-field-form/lib/utils/valueUtil';
import * as React from 'react';
import warning from '../_util/warning';
import { ConfigContext } from '../config-provider';
import { FormContext, FormItemPrefixContext } from './context';
import { getFieldId } from './util';

export interface FormListFieldData {
  name: number;
  key: number;
  /** @deprecated No need anymore Use key instead */
  fieldKey?: number;
}

export interface FormListOperation {
  add: (defaultValue?: StoreValue, insertIndex?: number) => void;
  remove: (index: number | number[]) => void;
  move: (from: number, to: number) => void;
}

export interface FormListProps {
  prefixCls?: string;
  name: string | number | (string | number)[];
  rules?: ValidatorRule[];
  initialValue?: any[];
  children: (
    fields: FormListFieldData[],
    operation: FormListOperation,
    meta: { errors: React.ReactNode[]; warnings: React.ReactNode[] },
  ) => React.ReactNode;
}

const FormList: React.FC<FormListProps> = ({
  prefixCls: customizePrefixCls,
  children,
  ...props
}) => {
  warning(!!props.name, 'Form.List', 'Miss `name` prop.');

  const { getPrefixCls } = React.useContext(ConfigContext);
  const prefixCls = getPrefixCls('form', customizePrefixCls);
  const contextValue = React.useMemo(
    () => ({
      prefixCls,
      status: 'error' as const,
    }),
    [prefixCls],
  );
  const { name: formName } = React.useContext(FormContext);
  const fieldId = getFieldId(getNamePath(props.name), formName);

  return (
    <div id={fieldId}>
      <List {...props}>
        {(fields, operation, meta) => (
          <FormItemPrefixContext.Provider value={contextValue}>
            {children(
              fields.map((field) => ({ ...field, fieldKey: field.key })),
              operation,
              {
                errors: meta.errors,
                warnings: meta.warnings,
              },
            )}
          </FormItemPrefixContext.Provider>
        )}
      </List>
    </div>
  );
};

export default FormList;
