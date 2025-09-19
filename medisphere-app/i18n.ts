// i18n.ts
import en from "./messages/en.json";
import hi from "./messages/hi.json";
import kn from "./messages/kn.json";
import ta from "./messages/ta.json";
import gu from "./messages/gu.json";
import mr from "./messages/mr.json";

const LOCALES: Record<string, Record<string, string>> = {
  en,
  hi,
  kn,
  ta,
  gu,
  mr,
};

export function getMessages(locale: string) {
  const short = locale?.split("-")[0] ?? "en";
  return LOCALES[short] ?? LOCALES.en;
}
