import * as React from 'react';
import DownOutlined from '@ant-design/icons/DownOutlined';
import LoadingOutlined from '@ant-design/icons/LoadingOutlined';
import CheckOutlined from '@ant-design/icons/CheckOutlined';
import CloseOutlined from '@ant-design/icons/CloseOutlined';
import CloseCircleFilled from '@ant-design/icons/CloseCircleFilled';
import SearchOutlined from '@ant-design/icons/SearchOutlined';
import { ReactNode } from 'react';
import { ValidateStatus } from '../../form/FormItem';
import iconMap from '../../_util/validationIcons';

export default function getIcons({
  suffixIcon,
  clearIcon,
  menuItemSelectedIcon,
  removeIcon,
  loading,
  multiple,
  validateStatus,
  prefixCls,
}: {
  suffixIcon?: React.ReactNode;
  clearIcon?: React.ReactNode;
  menuItemSelectedIcon?: React.ReactNode;
  removeIcon?: React.ReactNode;
  loading?: boolean;
  multiple?: boolean;
  validateStatus?: ValidateStatus;
  prefixCls: string;
}) {
  // Clear Icon
  let mergedClearIcon = clearIcon;
  if (!clearIcon) {
    mergedClearIcon = <CloseCircleFilled />;
  }

  // Validation Feedback Icon
  const ValidationIconNode = validateStatus && iconMap[validateStatus];
  const getSuffixIconNode = (arrowIcon?: ReactNode) => (
    <>
      {arrowIcon}
      {ValidationIconNode && (
        <span className={`${prefixCls}-feedback-icon`}>
          <ValidationIconNode />
        </span>
      )}
    </>
  );

  // Arrow item icon
  let mergedSuffixIcon = null;
  if (suffixIcon !== undefined) {
    mergedSuffixIcon = getSuffixIconNode(suffixIcon);
  } else if (loading) {
    mergedSuffixIcon = getSuffixIconNode(<LoadingOutlined spin />);
  } else {
    const iconCls = `${prefixCls}-suffix`;
    mergedSuffixIcon = ({ open, showSearch }: { open: boolean; showSearch: boolean }) => {
      if (open && showSearch) {
        return getSuffixIconNode(<SearchOutlined className={iconCls} />);
      }
      return getSuffixIconNode(<DownOutlined className={iconCls} />);
    };
  }

  // Checked item icon
  let mergedItemIcon = null;
  if (menuItemSelectedIcon !== undefined) {
    mergedItemIcon = menuItemSelectedIcon;
  } else if (multiple) {
    mergedItemIcon = <CheckOutlined />;
  } else {
    mergedItemIcon = null;
  }

  let mergedRemoveIcon = null;
  if (removeIcon !== undefined) {
    mergedRemoveIcon = removeIcon;
  } else {
    mergedRemoveIcon = <CloseOutlined />;
  }

  return {
    clearIcon: mergedClearIcon,
    suffixIcon: mergedSuffixIcon,
    itemIcon: mergedItemIcon,
    removeIcon: mergedRemoveIcon,
  };
}
