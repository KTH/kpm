import { en } from "./en";
import { sv } from "./sv";

const doCheckTranslations =
  process?.env.NODE_ENV !== "production" && process?.env.NODE_ENV !== "test";

export const LANG = window.__kpmSettings__?.["lang"] || "en";

export type TLang = "sv" | "en";

export function i18n(strObj: Record<TLang, string> | string): string {
  const lang: TLang = LANG as TLang;

  if (typeof strObj === "object") {
    return strObj[lang];
  }

  switch (lang) {
    case "sv":
      if (sv.hasOwnProperty(strObj)) return sv[strObj]!;
      break;
    case "en":
      if (en.hasOwnProperty(strObj)) return en[strObj]!;
      break;
  }

  if (doCheckTranslations) {
    console.warn(`No translation for: "${strObj}"`);
  }
  return strObj;
}
