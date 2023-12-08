import { forwardRef, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Icon } from '../Icon';
import Button from '../actions/Button';
import ComboboxInput from './ComboboxInput';

export type ReorderableMultiselectInputProps =
  BaseReorderableMultiselectInputProps & {
    required?: boolean;
    isolate?: boolean;
  };

export default function ReorderableMultiselectInput(
  props: ReorderableMultiselectInputProps
) {
  const context = useFormContext();

  if (context && !props.isolate) {
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
>(({ className = '', value, onChange, items }, ref) => {
  const selected: string[] = value ?? [];
  const { t } = useTranslation(['common']);
  const [newItemValue, setNewItemValue] = useState('');
  const addItem = () => {
    if (newItemValue) {
      const newValue = [...selected, newItemValue];
      onChange?.(newValue);
      setNewItemValue('');
    }
  };
  const moveItem = (from: number, to: number) => {
    const newValue = [...selected];
    newValue.splice(to, 0, newValue.splice(from, 1)[0]);
    onChange?.(newValue);
  };
  const removeItem = (index: number) => {
    const newValue = [...selected];
    newValue.splice(index, 1);
    onChange?.(newValue);
  };
  const availableNewItems = items.filter(
    (item) => !selected.includes(item.value)
  );
  return (
    <div
      className={`${className} group/multiselect relative flex flex-col gap-1`}
    >
      {selected.length > 0 && (
        <div className="border rounded flex-col shadow-inner flex border-slate-400">
          {selected
            .map((v) => items.find((i) => i.value === v))
            .filter((item?: ItemType): item is ItemType => !!item)
            .map((item, i, value) => {
              const isFirst = i === 0;
              const isLast = i === value.length - 1;
              return (
                <div className="py-2 px-1 flex items-center" key={item.value}>
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
                    <span className="sr-only">{t('common:direction.up')}</span>
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
                    <span className="sr-only">
                      {t('common:direction.down')}
                    </span>
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
      )}
      <div className="flex gap-1">
        <ComboboxInput
          name="new"
          className="grow block"
          value={newItemValue}
          onChange={setNewItemValue}
          items={availableNewItems}
          disabled={availableNewItems.length === 0}
          autoComplete="off"
          isolate
        />
        <Button onClick={addItem}>
          <Icon icon="add" />
          <span className="ms-1">{t('common:add')}</span>
        </Button>
      </div>
    </div>
  );
});
