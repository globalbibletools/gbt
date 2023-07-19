import { useFormState } from 'react-hook-form';

export interface InputErrorProps {
  id: string;
  name: string;
  messages: Record<string, string>;
}

export default function InputError({ id, name, messages }: InputErrorProps) {
  const { errors } = useFormState({ name });
  const fieldError = errors[name];

  if (fieldError && fieldError.type) {
    return (
      <div id={id} className="text-red-700">
        {messages[fieldError.type.toString()]}
      </div>
    );
  } else {
    return null;
  }
}
