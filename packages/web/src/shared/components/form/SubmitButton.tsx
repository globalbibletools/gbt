import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../LoadingSpinner';
import Button from '../actions/Button';
import { ReactNode } from 'react';

export interface SubmitButtonProps {
  className?: string;
  children?: ReactNode;
}

export default function SubmittingIndicator({
  className = '',
  children,
}: SubmitButtonProps) {
  const { t } = useTranslation(['common']);
  const { isSubmitting } = useFormState();

  return (
    <Button className={className} type="submit">
      {isSubmitting ? (
        <div className="flex flex-row gap-2">
          <LoadingSpinner className="inline-block" />
          <span role="status">{t('common:submitting')}</span>
        </div>
      ) : (
        children
      )}
    </Button>
  );
}
