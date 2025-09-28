const localeRules: Record<string, {
  categories: string[];
  select: (value: number) => string;
}> = {
  en: {
    categories: ['one', 'other'],
    select: (value: number) => {
      return Math.abs(value) === 1 ? 'one' : 'other';
    }
  },
  ar: {
    categories: ['zero', 'one', 'two', 'few', 'many', 'other'],
    select: (value: number) => {
      const n = Math.abs(value);
      const integer = Math.floor(n);
      const fraction = n - integer;
      if (fraction !== 0) return 'other';
      const mod100 = integer % 100;
      if (integer === 0) return 'zero';
      if (integer === 1) return 'one';
      if (integer === 2) return 'two';
      if (mod100 >= 3 && mod100 <= 10) return 'few';
      if (mod100 >= 11 && mod100 <= 99) return 'many';
      return 'other';
    }
  }
};

const getLocaleConfig = (locale: string) => {
  const normalized = locale.toLowerCase().split('-')[0];
  return localeRules[normalized] ?? localeRules.en;
};

if (typeof globalThis.Intl === 'undefined') {
  (globalThis as any).Intl = {};
}

if (typeof globalThis.Intl.PluralRules === 'undefined') {
  class PluralRulesPolyfill {
    private readonly locale: string;
    private readonly type: 'cardinal' | 'ordinal';

    constructor(locale: string | string[] = 'en', options?: { type?: 'cardinal' | 'ordinal' }) {
      this.locale = Array.isArray(locale) ? locale[0] : locale;
      this.type = options?.type ?? 'cardinal';
      if (this.type !== 'cardinal') {
        console.warn('PluralRules polyfill only supports cardinal numbers.');
      }
    }

    select(value: number) {
      const config = getLocaleConfig(this.locale);
      return config.select(value);
    }

    resolvedOptions() {
      const config = getLocaleConfig(this.locale);
      return {
        locale: this.locale,
        pluralCategories: config.categories,
        type: this.type
      };
    }
  }

  (globalThis.Intl as any).PluralRules = PluralRulesPolyfill;
}
