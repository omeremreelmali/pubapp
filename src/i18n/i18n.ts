"use client";

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import commonEnglish from "../locales/en/common.json";
import commonTurkish from "../locales/tr/common.json";

const resources = {
  en: {
    common: commonEnglish,
  },
  tr: {
    common: commonTurkish,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  fallbackLng: "tr",
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
