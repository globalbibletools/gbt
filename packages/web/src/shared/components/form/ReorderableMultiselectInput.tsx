import { forwardRef } from 'react';
import { Controller, useForm, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Icon } from '../Icon';
import Button from '../actions/Button';
import ComboboxInput from './ComboboxInput';
import Form from './Form';

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

type NewItemFormData = { newItem: string };

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
    const newItemContext = useForm<NewItemFormData>();
    const addItem = (data: NewItemFormData) => {
      console.log(data);
      // if (value) {
      //   const newValue = [...(value ?? []), itemValue];
      //   onChange?.(newValue);
      // }
    };
    const moveItem = (from: number, to: number) => {
      const newValue = [...(value ?? [])];
      newValue.splice(to, 0, newValue.splice(from, 1)[0]);
      onChange?.(newValue);
    };
    const removeItem = (index: number) => {
      const newValue = [...(value ?? [])];
      newValue.splice(index, 1);
      onChange?.(newValue);
    };
    return (
      <div
        className={`${className} group/multiselect relative flex flex-col gap-1`}
      >
        <div className="border rounded flex-col shadow-inner flex border-slate-400">
          {(value ?? [])
            .map((v) => items.find((i) => i.value === v))
            .filter((item?: ItemType): item is ItemType => !!item)
            .map((item, i, value) => {
              const isFirst = i === 0;
              const isLast = i === value.length - 1;
              return (
                <div className="py-2 px-1 flex items-center" key={item.value}>
                  <button className="w-8 h-8" type="button">
                    <Icon icon="grip-vertical" />
                    {/* TODO: use different text */}
                    <span className="sr-only">{t('common:close')}</span>
                  </button>
                  <span className="grow mx-1">{item.label}</span>
                  <button
                    className={`w-8 h-8 pt-[2px] ${
                      isFirst && 'disabled:opacity-25'
                    }`}
                    type="button"
                    disabled={isFirst}
                    onClick={() => moveItem(i, i - 1)}
                  >
                    <Icon icon="chevron-up" />
                    {/* TODO: use different text */}
                    <span className="sr-only">{t('common:close')}</span>
                  </button>
                  <button
                    className={`w-8 h-8 pb-[2px] ${
                      isLast && 'disabled:opacity-25'
                    }`}
                    type="button"
                    disabled={isLast}
                    onClick={() => moveItem(i, i + 1)}
                  >
                    <Icon icon="chevron-down" />
                    {/* TODO: use different text */}
                    <span className="sr-only">{t('common:close')}</span>
                  </button>
                  <button
                    className="w-8 h-8"
                    type="button"
                    onClick={() => removeItem(i)}
                  >
                    <Icon icon="close" />
                    <span className="sr-only">{t('common:close')}</span>
                  </button>
                </div>
              );
            })}
        </div>
        <Form
          className="flex gap-1"
          context={newItemContext}
          onSubmit={addItem}
        >
          <ComboboxInput name="new" className="grow block" items={items} />
          <Button type="submit">
            <Icon icon="add" />
            <span className="ms-1">{t('common:add')}</span>
          </Button>
        </Form>
      </div>
    );
  }
);
