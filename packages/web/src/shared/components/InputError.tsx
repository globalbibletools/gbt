import { useFormState } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

export interface InputErrorProps {
  id: string;
  name: string;
  context: string;
}

export default function InputError({ id, name, context }: InputErrorProps) {
  const { errors } = useFormState({ name });
  const fieldError = errors[name];

  const { t } = useTranslation('error');

  if (fieldError) {
    return (
      <div id={id} className="text-red-700">
        {(() => {
          switch (fieldError.type) {
            case 'required': {
              return t('required', { context });
            }
            default:
              return 'Unknown';
          }
        })()}
      </div>
    );
  } else {
    return null;
  }
}
