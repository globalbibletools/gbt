import { ComponentProps } from 'react';
import {
  FormProvider,
  FieldValues,
  UseFormReturn,
  SubmitHandler,
} from 'react-hook-form';

export interface FormProps<Data extends FieldValues>
  extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  context: UseFormReturn<Data>;
  onSubmit?: SubmitHandler<Data>;
}

export default function Form<Data extends FieldValues>({
  onSubmit,
  context,
  children,
  ...props
}: FormProps<Data>) {
  const { handleSubmit, formState } = context;

  return (
    <form
      {...props}
      onSubmit={(e) => {
        if (!formState.isSubmitting) {
          handleSubmit(async (data) => {
            await onSubmit?.(data);
          })(e);
        } else {
          e.preventDefault();
        }
      }}
    >
      <FormProvider {...context}>{children}</FormProvider>
    </form>
  );
}
