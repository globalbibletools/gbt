import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import LoadingSpinner from '../LoadingSpinner';

export interface SubmittingIndicatorProps {
  className?: string;
}

export default function SubmittingIndicator({
  className = '',
}: SubmittingIndicatorProps) {
  const { t } = useTranslation();
  const { isSubmitting } = useFormState();

  return isSubmitting ? (
    <div className={`${className} inline-block`}>
      <LoadingSpinner className="inline-block" />
      <span role="status" className="sr-only">
        {t('submitting')}
      </span>
    </div>
  ) : null;
}
