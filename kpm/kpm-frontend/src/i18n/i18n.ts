import { en } from "./en";
import { sv } from "./sv";

const doCheckTranslations =
  process?.env.NODE_ENV !== "production" && process?.env.NODE_ENV !== "test";

export type TLang = "sv" | "en";

export function i18n(strObj: Record<TLang, string> | string): string {
  // TODO: Figure out how we want to get/set language for the entire menu
  const lang: TLang = "sv" as TLang;
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
