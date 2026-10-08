/**
 * Recognizable tickers for beginners who don't know symbols yet. Names are
 * shown instantly without waiting for the backend's asset list.
 */
export interface PopularStock {
  symbol: string;
  name: string;
  sector: string;
}

export const POPULAR_STOCKS: PopularStock[] = [
  { symbol: "AAPL", name: "Apple", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft", sector: "Technology" },
  { symbol: "NVDA", name: "Nvidia", sector: "Semiconductors" },
  { symbol: "GOOGL", name: "Alphabet", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon", sector: "Retail" },
  { symbol: "META", name: "Meta Platforms", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla", sector: "Automotive" },
  { symbol: "NFLX", name: "Netflix", sector: "Media" },
  { symbol: "AMD", name: "AMD", sector: "Semiconductors" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Banking" },
  { symbol: "V", name: "Visa", sector: "Payments" },
  { symbol: "DIS", name: "Disney", sector: "Media" },
  { symbol: "KO", name: "Coca-Cola", sector: "Beverages" },
  { symbol: "NKE", name: "Nike", sector: "Apparel" },
  { symbol: "WMT", name: "Walmart", sector: "Retail" },
  { symbol: "SPY", name: "S&P 500 ETF", sector: "Index fund" },
  { symbol: "QQQ", name: "Nasdaq-100 ETF", sector: "Index fund" },
];

export const TICKER_TAPE = ["SPY", "QQQ", "AAPL", "MSFT", "NVDA", "GOOGL", "AMZN", "META", "TSLA", "JPM"];

const NAMES = Object.fromEntries(POPULAR_STOCKS.map((s) => [s.symbol, s.name]));
export const knownName = (symbol: string): string | undefined => NAMES[symbol];
