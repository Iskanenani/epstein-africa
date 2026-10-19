import { getCanonicalUrl } from "./i18n";

// Language alternates for a page that exists in English and French.
// Google ignores hreflang unless every version lists itself, the other
// language, and an x-default. Returns an array so it can sit directly
// inside next/head.
export function hreflangLinks(path) {
  return [
    <link key="hreflang-en" rel="alternate" hrefLang="en" href={getCanonicalUrl(path, "en")} />,
    <link key="hreflang-fr" rel="alternate" hrefLang="fr" href={getCanonicalUrl(path, "fr")} />,
    <link key="hreflang-x-default" rel="alternate" hrefLang="x-default" href={getCanonicalUrl(path, "en")} />,
  ];
}
