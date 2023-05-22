import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from 'react';
import { Transition } from '@headlessui/react';
import { Icon } from '../components/Icon';
import { useTranslation } from 'react-i18next';

type FlashMessageType = 'error' | 'success';
interface FlashMessage {
  id: string;
  message: string;
  level: FlashMessageType;
  state: 'unshown' | 'shown' | 'dismissed';
  timeout?: number;
  timeoutId?: ReturnType<typeof setTimeout>;
}

interface FlashContextValue {
  error(message: string): void;
  success(message: string, timeout?: number): void;
  remove(id: string): void;
  clear(): void;
}
const FlashContext = createContext<FlashContextValue | null>(null);

export interface FlashProviderProps {
  children: ReactNode;
}

function generateId() {
  return Math.floor(Math.random() * 100_000_000).toString();
}

export function FlashProvider({ children }: FlashProviderProps) {
  const { t } = useTranslation(['error', 'translation']);

  const [messages, setMessages] = useState<FlashMessage[]>([]);

  const error = useCallback((message: string) => {
    setMessages((messages) => [
      { id: generateId(), message, level: 'error', state: 'unshown' },
      ...messages,
    ]);
  }, []);

  const remove = useCallback((id: string) => {
    setMessages((messages) =>
      messages.map((message) =>
        message.id === id ? { ...message, state: 'dismissed' } : message
      )
    );
  }, []);

  const success = useCallback(
    (message: string, timeout = 3000) => {
      const id = generateId();
      setMessages((messages) => [
        {
          id,
          message,
          level: 'success',
          state: 'unshown',
          timeout,
          timeoutId: setTimeout(() => {
            remove(id);
          }, timeout),
        },
        ...messages,
      ]);
    },
    [remove]
  );

  const clear = useCallback(() => {
    setMessages([]);
  }, []);

  return (
    <FlashContext.Provider value={{ error, success, remove, clear }}>
      {children}
      <div className="fixed top-0 w-full flex justify-center items-start z-10 pointer-events-none">
        {messages.slice(0, 1).map((message) => {
          return (
            <Transition
              key={message.id}
              appear={message.state === 'unshown'}
              show={message.state !== 'dismissed'}
              className={`
                mt-2 rounded shadow border font-bold flex items-stretch bg-white
                pointer-events-auto
                ${
                  message.level === 'success'
                    ? 'border-green-600'
                    : 'border-red-600'
                }
              `}
              enter="transition-opacity transition-transform duration-300"
              enterFrom="opacity-0 -translate-y-4"
              enterTo="opacity-100 translate-y-0"
              leave="transition-opacity duration-75"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
              afterEnter={() => {
                setMessages((messages) =>
                  messages.map((m, i) => ({ ...m, state: 'shown' }))
                );
              }}
              afterLeave={() =>
                setMessages((messages) =>
                  messages.filter((m) => m.id !== message.id)
                )
              }
            >
              <div
                className={`
                w-9
                ${message.level === 'success' ? 'bg-green-600' : 'bg-red-600'}
              `}
              >
                <div className="flex justify-center items-center py-2 h-10">
                  <Icon
                    icon={
                      message.level === 'success'
                        ? 'check'
                        : 'exclamation-triangle'
                    }
                    size="lg"
                    className=" text-white"
                  />
                </div>
              </div>
              <div role="alert" className="py-2 px-3">
                <span className="sr-only">
                  {message.level === 'error' ? t('error') : t('success')}:
                </span>
                {message.message}
              </div>
              <button
                type="button"
                className="w-10 h-10 rounded focus:outline focus:outline-2 focus:outline-blue-600"
                onClick={() => remove(message.id)}
              >
                <Icon icon="close" />
                <span className="sr-only">{t('close')}</span>
              </button>
            </Transition>
          );
        })}
      </div>
    </FlashContext.Provider>
  );
}

export function useFlash() {
  const context = useContext(FlashContext);
  if (!context) {
    throw new Error('useFlash should be used within FlashContext component.');
  }
  return context;
}
