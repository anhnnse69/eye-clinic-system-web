import { getRequestConfig } from 'next-intl/server';
import vi from '@/messages/vi.json';
import en from '@/messages/en.json';

const messagesMap: Record<string, object> = {
  vi: vi,
  en: en,
};

export const defaultLocale = 'vi';

export default getRequestConfig(async () => {
  return {
    locale: 'vi',
    messages: vi,
    timeZone: 'Asia/Ho_Chi_Minh',
    now: new Date(),
  };
});
