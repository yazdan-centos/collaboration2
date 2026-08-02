// SmartChildren.jsx
import React, {Children, cloneElement, isValidElement} from 'react';
import {Controller, FormProvider, useForm, useFormContext} from 'react-hook-form';

// ─── Detection ──────────────────────────────────────────────────────────────────
const getName = (el) => el?.type?.displayName || el?.type?.name || '';
const isNative = (el) => typeof el.type === 'string' && ['input', 'select', 'textarea'].includes(el.type);
const isReactSelect = (n) => ['Select', 'AsyncSelect', 'CreatableSelect'].includes(n);
const isDatePicker = (n) => n === 'DatePicker';
const isNumberInput = (n) => n === 'NumberInput';
const isQuill = (n) => ['ReactQuill', 'Quill'].includes(n);
const isDropzone = (n) => ['Dropzone', 'FileDropzone'].includes(n);

// ─── Styled native wrapper ───────────────────────────────────────────────────────
function StyledNative({hasError, inputRef, ...props}) {
    const [focused, setFocused] = React.useState(false);
    const Tag = props.as || 'input';
    return (
        <Tag
            ref={inputRef}
            {...props}
            style={{
                width: '100%', padding: '12px 14px', fontSize: '16px', boxSizing: 'border-box',
                border: `1px solid ${hasError ? '#d32f2f' : focused ? '#1976d2' : 'rgba(0,0,0,0.23)'}`,
                borderRadius: '4px', outline: 'none', background: 'transparent',
                boxShadow: focused ? `0 0 0 2px ${hasError ? 'rgba(211,47,47,0.2)' : 'rgba(25,118,210,0.2)'}` : 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
                setFocused(true);
                props.onFocus?.(e);
            }}
            onBlur={(e) => {
                setFocused(false);
                props.onBlur?.(e);
            }}
        />
    );
}

// ─── MUI-like field wrapper ──────────────────────────────────────────────────────
function FieldWrapper({label, error, children}) {
    return (
        <div style={{position: 'relative', marginBottom: 24}}>
            {label && (
                <label style={{
                    position: 'absolute', top: -10, right: 12, fontSize: 12, zIndex: 1,
                    color: error ? '#d32f2f' : '#1976d2', background: '#fff', padding: '0 4px',
                }}>
                    {label}
                </label>
            )}
            {children}
            {error && <p style={{fontSize: 12, margin: '4px 14px 0', color: '#d32f2f'}}>{error.message}</p>}
        </div>
    );
}

// ─── react-select MUI styles ─────────────────────────────────────────────────────
const selectStyles = {
    control: (base, {isFocused}) => ({
        ...base, minHeight: 48, borderRadius: 4,
        borderColor: isFocused ? '#1976d2' : 'rgba(0,0,0,0.23)',
        boxShadow: isFocused ? '0 0 0 2px rgba(25,118,210,0.2)' : 'none',
        '&:hover': {borderColor: '#1976d2'},
    }),
    menu: (base) => ({...base, zIndex: 9999}),
};

// ─── SmartChild ─────────────────────────────────────────────────────────────────
export function SmartChild({child}) {
    const {register, control, formState: {errors}} = useFormContext();
    if (!isValidElement(child)) return child;

    const {name, label, rules, ...rest} = child.props;
    if (!name) return child;

    const error = errors[name];
    const displayName = getName(child);

    // Native inputs
    if (isNative(child)) {
        const {ref, ...regProps} = register(name, rules);
        return (
            <FieldWrapper label={label} error={error}>
                <StyledNative
                    as={child.type}
                    inputRef={ref}
                    {...rest}
                    {...regProps}
                    hasError={!!error}
                />
            </FieldWrapper>
        );
    }

    // react-select
    if (isReactSelect(displayName)) {
        return (
            <FieldWrapper label={label} error={error}>
                <Controller
                    name={name}
                    control={control}
                    rules={rules}
                    render={({field}) =>
                        cloneElement(child, {
                            ...rest,
                            value: field.value ?? null,
                            onChange: (opt) => field.onChange(opt),
                            onBlur: field.onBlur,
                            styles: {...selectStyles, ...rest.styles},
                        })
                    }
                />
            </FieldWrapper>
        );
    }

    // react-multi-date-picker
    if (isDatePicker(displayName)) {
        return (
            <FieldWrapper label={label} error={error}>
                <Controller
                    name={name}
                    control={control}
                    rules={rules}
                    render={({field}) =>
                        cloneElement(child, {
                            ...rest,
                            value: field.value ?? null
                        })
                    }
                />
            </FieldWrapper>
        );
    }

    // react-number-input
    if (isNumberInput(displayName)) {
        return (
            <FieldWrapper label={label} error={error}>
                <Controller
                    name={name}
                    control={control}
                    rules={rules}
                    render={({field}) =>
                        cloneElement(child, {
                            ...rest,
                            value: field.value ?? null
                        })
                    }
                />
            </FieldWrapper>
        );
    }

    // react-quill
    if (isQuill(displayName)) {
        return (
            <FieldWrapper label={label} error={error}>
                <Controller
                    name={name}
                    control={control}
                    rules={rules}
                    render={({field}) => cloneElement(child, {
                        ...rest,
                        value: field.value ?? '',
                        onChange: field.onChange,
                        onBlur: field.onBlur,
                    })}
                />
            </FieldWrapper>
        );
    }

    // react-dropzone
    if (isDropzone(displayName)) {
        return (
            <FieldWrapper label={label} error={error}>
                <Controller
                    name={name}
                    control={control}
                    rules={rules}
                    render={({field}) =>
                        cloneElement(child, {
                            ...rest,
                            value: field.value ?? null,
                            onChange: field.onChange,
                            onBlur: field.onBlur,
                        })
                    }
                />
            </FieldWrapper>
        );
    }

    return child;
}

function enhanceChildren(children) {
    return Children.map(children, (child) => {
        if (!isValidElement(child)) return child;
        if (child.props.name) return <SmartChild child={child}/>;
        if (!child.props.children) return child;
        return cloneElement(child, undefined, enhanceChildren(child.props.children));
    });
}

export function SmartForm({children, onSubmit, defaultValues = {}, formOptions = {}, ...formProps}) {
    const methods = useForm({defaultValues, ...formOptions});

    return (
        <FormProvider {...methods}>
            <form {...formProps} onSubmit={methods.handleSubmit(onSubmit)} noValidate>
                {enhanceChildren(children)}
            </form>
        </FormProvider>
    );
}

export default SmartForm;
