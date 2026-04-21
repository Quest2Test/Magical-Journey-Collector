import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Currency = "usd" | "eur" | "gbp";

interface CurrencyProviderState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  formatPrice: (usdValue: number | null | undefined) => string;
}

const initialState: CurrencyProviderState = {
  currency: "usd",
  setCurrency: () => null,
  formatPrice: () => "",
};

const CurrencyProviderContext = createContext<CurrencyProviderState>(initialState);

export function CurrencyProvider({
  children,
  defaultCurrency = "usd",
  storageKey = "glimmercast-currency",
  ...props
}: {
  children: ReactNode;
  defaultCurrency?: Currency;
  storageKey?: string;
}) {
  const [currency, setCurrency] = useState<Currency>(() => {
    try {
      return (localStorage.getItem(storageKey) as Currency) || defaultCurrency;
    } catch {
      return defaultCurrency;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, currency);
    } catch {
      // ignore
    }
  }, [currency, storageKey]);

  const value = {
    currency,
    setCurrency,
    formatPrice: (usdValue: number | null | undefined) => {
      if (usdValue === null || usdValue === undefined) return "N/A";
      
      let convertedValue = usdValue;
      let symbol = "$";

      if (currency === "eur") {
        convertedValue = usdValue * 0.92;
        symbol = "€";
      } else if (currency === "gbp") {
        convertedValue = usdValue * 0.79;
        symbol = "£";
      }

      return `${symbol}${convertedValue.toFixed(2)}`;
    },
  };

  return (
    <CurrencyProviderContext.Provider {...props} value={value}>
      {children}
    </CurrencyProviderContext.Provider>
  );
}

export const useCurrency = () => {
  const context = useContext(CurrencyProviderContext);

  if (context === undefined)
    throw new Error("useCurrency must be used within a CurrencyProvider");

  return context;
};
