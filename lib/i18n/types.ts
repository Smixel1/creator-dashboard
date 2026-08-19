import type { ru } from "./ru";

export type Locale = "ru" | "en";

export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALES: Locale[] = ["ru", "en"];

type DeepStringify<T> = {
  [K in keyof T]: T[K] extends string
    ? string
    : T[K] extends Record<string, unknown>
      ? DeepStringify<T[K]>
      : never;
};

export type Messages = DeepStringify<typeof ru>;

type Join<K extends string, P extends string> = P extends ""
  ? K
  : `${K}.${P}`;

type LeafKeys<T, Prefix extends string = ""> = {
  [K in keyof T & string]: T[K] extends string
    ? Prefix extends ""
      ? K
      : Join<Prefix, K>
    : T[K] extends Record<string, unknown>
      ? LeafKeys<T[K], Prefix extends "" ? K : Join<Prefix, K>>
      : never;
}[keyof T & string];

export type DotTranslationKey = LeafKeys<Messages>;

export type Translator = (
  key: DotTranslationKey,
  params?: Record<string, string | number>
) => string;
