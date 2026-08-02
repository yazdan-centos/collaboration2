import React, { useCallback } from 'react';
import AsyncSelect from 'react-select/async';

const DEFAULT_MESSAGES = {
  loading: 'در حال دریافت گزینه‌ها...',
  noOptions: 'گزینه‌ای پیدا نشد',
  placeholder: 'جستجو و انتخاب...',
};

export default function ServerAsyncSelect({
  loadOptions,
  value,
  onChange,
  placeholder = DEFAULT_MESSAGES.placeholder,
  loadingMessage = DEFAULT_MESSAGES.loading,
  noOptionsMessage = DEFAULT_MESSAGES.noOptions,
  isClearable = true,
  defaultOptions = true,
  ...props
}) {
  const safeLoadOptions = useCallback(async (inputValue) => {
    try {
      const options = await loadOptions?.(inputValue.trim());
      return Array.isArray(options) ? options : [];
    } catch {
      return [];
    }
  }, [loadOptions]);

  return (
    <AsyncSelect
      {...props}
      className="server-async-select"
      classNamePrefix="server-select"
      value={value}
      onChange={onChange}
      loadOptions={safeLoadOptions}
      defaultOptions={defaultOptions}
      cacheOptions
      isClearable={isClearable}
      isSearchable
      menuPortalTarget={typeof document === 'undefined' ? undefined : document.body}
      menuPosition="fixed"
      placeholder={placeholder}
      loadingMessage={() => loadingMessage}
      noOptionsMessage={() => noOptionsMessage}
      openMenuOnFocus
      unstyled
    />
  );
}
