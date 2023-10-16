import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../LoadingSpinner';

export interface SubmittingIndicatorProps {
  className?: string;
}

export default function SubmittingIndicator({
  className = '',
}: SubmittingIndicatorProps) {
  const { t } = useTranslation(['common']);
  const { isSubmitting } = useFormState();

  return isSubmitting ? (
    <div className={`${className} inline-block`}>
      <LoadingSpinner className="inline-block" />
      <span role="status">{t('common:submitting')}</span>
    </div>
  ) : null;
}
