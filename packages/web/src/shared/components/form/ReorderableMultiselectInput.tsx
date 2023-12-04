import { Combobox } from '@headlessui/react';
import { forwardRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Icon } from '../Icon';
import Button from '../actions/Button';

export type ReorderableMultiselectInputProps =
  BaseReorderableMultiselectInputProps & {
    required?: boolean;
  };

export default function ReorderableMultiselectInput(
  props: ReorderableMultiselectInputProps
) {
  const context = useFormContext();

  if (context) {
    return (
      <Controller
        control={context.control}
        name={props.name}
        defaultValue={props.defaultValue}
        rules={{ required: props.required }}
        render={({ field, fieldState }) => (
          <BaseReorderableMultiselectInput
            {...field}
            items={props.items}
            hasErrors={!!fieldState.error}
            placeholder={props.placeholder}
          />
        )}
      />
    );
  } else {
    return <BaseReorderableMultiselectInput {...props} />;
  }
}

interface BaseReorderableMultiselectInputProps {
  className?: string;
  name: string;
  items: ItemType[];
  value?: string[];
  defaultValue?: string[];
  hasErrors?: boolean;
  placeholder?: string;
  onChange?(value: string[]): void;
  onBlur?(): void;
}

type ItemType = { label: string; value: string };

const BaseReorderableMultiselectInput = forwardRef<
  HTMLInputElement,
  BaseReorderableMultiselectInputProps
>(
  (
    {
      className = '',
      hasErrors,
      value,
      onChange,
      onBlur,
      items,
      name,
      defaultValue,
      placeholder,
    },
    ref
  ) => {
    const { t } = useTranslation(['common']);
    return (
      <div
        className={`${className} group/multiselect relative flex flex-col gap-1`}
      >
        <div className="border rounded flex-col shadow-inner flex border-slate-400">
          {(value ?? [])
            .map((v) => items.find((i) => i.value === v))
            .filter((item?: ItemType): item is ItemType => !!item)
            .map((item) => (
              <div className="py-2 px-3 flex items-center" key={item.value}>
                <span className="grow">{item.label}</span>
              </div>
            ))}
        </div>
        <div className="flex gap-1">
          <Combobox
            value={value}
            onChange={onChange}
            multiple
            name={name}
            defaultValue={defaultValue}
          >
            <div
              className={`
            border rounded shadow-inner flex grow
            group-focus-within/multiselect:outline group-focus-within/multiselect:outline-2
            ${
              hasErrors
                ? 'border-red-700 shadow-red-100 group-focus-within/multiselect:outline-red-700'
                : 'border-slate-400 group-focus-within/multiselect:outline-blue-600'
            }
          `}
            >
              <Combobox.Input
                className="w-full py-2 px-3 h-10 rounded-b flex-grow focus:outline-none bg-transparent rounded"
                readOnly
                ref={ref}
                onBlur={onBlur}
                displayValue={(value: string[]) =>
                  value
                    .map((v) => items.find((i) => i.value === v)?.label ?? '')
                    .join(', ')
                }
                placeholder={placeholder}
              />
              <Combobox.Button className="w-8">
                {({ open }) => <Icon icon={open ? 'caret-up' : 'caret-down'} />}
              </Combobox.Button>
            </div>
            <Combobox.Options className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded border border-slate-400 bg-white shadow">
              {items.map((item) => (
                <Combobox.Option
                  className="px-3 py-2 ui-active:bg-blue-400"
                  key={item.value}
                  value={item.value}
                >
                  {({ selected }) => (
                    <>
                      <span className="inline-block w-6">
                        {selected && <Icon icon="check" />}
                      </span>
                      {item.label}
                    </>
                  )}
                </Combobox.Option>
              ))}
            </Combobox.Options>
          </Combobox>
          <Button>
            <Icon icon="add" />
            <span className="ms-1">{t('common:add')}</span>
          </Button>
        </div>
      </div>
    );
  }
);
