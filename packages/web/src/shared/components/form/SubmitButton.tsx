import { ComponentProps } from 'react';
import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import Button from '../actions/Button';
import LoadingSpinner from '../LoadingSpinner';

export type SubmitButtonProps = Omit<ComponentProps<typeof Button>, 'type'>;

export default function SubmitButton({
  children,
  ...props
}: SubmitButtonProps) {
  const { isSubmitting } = useFormState();
  const { t } = useTranslation();

  return (
    <Button {...props} type="submit">
      {isSubmitting ? (
        <>
          <LoadingSpinner className="inline-block mr-2" />
          {t('submitting')}
        </>
      ) : (
        children
      )}
    </Button>
  );
}
