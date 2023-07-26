import { ComponentProps } from 'react';
import { FormProvider, FieldValues, UseFormReturn } from 'react-hook-form';

export interface SubmitHandler<Data> {
  (data: Data, options: { reset(): void }): Promise<void> | void;
}
export interface FormProps<Data extends FieldValues>
  extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  context: UseFormReturn<Data>;
  onSubmit: SubmitHandler<Data>;
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
            await onSubmit(data, { reset: context.reset });
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
