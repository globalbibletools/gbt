import { ComponentProps } from 'react';
import { useForm, FormProvider, FieldValues } from 'react-hook-form';

export interface SubmitHandler<Data> {
  (data: Data, options: { reset(): void }): Promise<void>;
}
export interface FormProps<Data>
  extends Omit<ComponentProps<'form'>, 'onSubmit'> {
  onSubmit: SubmitHandler<Data>;
}

export default function Form<Data extends FieldValues>({
  onSubmit,
  children,
  ...props
}: FormProps<Data>) {
  const formContext = useForm<Data>();
  const { handleSubmit, formState } = formContext;

  return (
    <form
      {...props}
      onSubmit={(e) => {
        if (!formState.isSubmitting) {
          handleSubmit(async (data) => {
            await onSubmit(data, { reset: formContext.reset });
          })(e);
        } else {
          e.preventDefault();
        }
      }}
    >
      <FormProvider {...formContext}>{children}</FormProvider>
    </form>
  );
}
