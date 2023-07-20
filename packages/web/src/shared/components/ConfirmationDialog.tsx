import { Dialog, Transition } from '@headlessui/react';
import {
  Fragment,
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';
import Button from './actions/Button';
import TextInput from './form/TextInput';

export interface ConfirmationDialogProps {
  title: string;
  description: string;
  confirmationValue: string;
}

export interface ConfirmationDialogRef {
  open(): Promise<boolean>;
}

const ConfirmationDialog = forwardRef<
  ConfirmationDialogRef,
  ConfirmationDialogProps
>(({ title, description, confirmationValue }: ConfirmationDialogProps, ref) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  useImperativeHandle(
    ref,
    () => ({
      async open() {
        return new Promise<boolean>((resolve) => {
          setIsOpen(true);
          // TODO: how do I call resolve when the confirm button is pressed, or the dialog is closed?

          // setIsOpen(false);
          // resolve(true);
        });
      },
    }),
    []
  );

  const { t } = useTranslation();
  const [enableConfirmationButton, setEnableConfirmationButton] =
    useState<boolean>(false);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        // TODO: correctly integrate with ref
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md flex flex-col gap-2 transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  {title}
                </Dialog.Title>
                <p className="text-sm text-red-500 font-bold">{description}</p>
                <p id="prompt" className="text-sm text-gray-600">
                  {t('confirm_prompt', { value: confirmationValue })}
                </p>
                <TextInput
                  id="confirm"
                  name="confirm"
                  className="w-full"
                  autoComplete="off"
                  required
                  onChange={(event) =>
                    setEnableConfirmationButton(
                      event.target.value == confirmationValue
                    )
                  }
                  aria-describedby="prompt"
                />
                <div className="mt-4 gap-4 flex flex-row justify-end">
                  <button
                    className="focus:underline outline-none"
                    onClick={() => setIsOpen(false)}
                  >
                    {t('cancel')}
                  </button>
                  <Button disabled={!enableConfirmationButton}>
                    {t('confirm')}
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
});
export default ConfirmationDialog;
