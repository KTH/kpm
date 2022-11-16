import { en } from "./en";
import { sv } from "./sv";

export type TLang = "sv" | "en";

export function i18n(
  strObj: Record<TLang, string> | string,
  lang: TLang = "sv"
): string {
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

  return strObj;
}
