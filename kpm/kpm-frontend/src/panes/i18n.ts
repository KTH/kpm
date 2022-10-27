export type TLang = "sv" | "en";

export function i18n(
  strObj: Record<TLang, string> | string,
  lang: TLang = "sv"
) {
  if (typeof strObj === "object") {
    return strObj[lang];
  }

  // TODO: Create language dict for static string lookup
  return strObj;
}
