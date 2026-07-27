type ClassValue = string | false | null | undefined;

export const cn = (...classNames: ClassValue[]): string =>
  classNames.filter(Boolean).join(" ");
