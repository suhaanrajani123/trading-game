/**
 * A curated list of well-known tickers for beginners who don't know
 * symbols off the top of their head. Not exhaustive, not investment
 * advice — just recognizable names across a spread of sectors.
 */
export interface PopularStock {
  symbol: string;
  name: string;
  sector: string;
}

export const POPULAR_STOCKS: PopularStock[] = [
  { symbol: "AAPL", name: "Apple", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon", sector: "Retail" },
  { symbol: "NVDA", name: "Nvidia", sector: "Semiconductors" },
  { symbol: "META", name: "Meta Platforms", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla", sector: "Automotive" },
  { symbol: "NFLX", name: "Netflix", sector: "Media" },
  { symbol: "AMD", name: "Advanced Micro Devices", sector: "Semiconductors" },
  { symbol: "INTC", name: "Intel", sector: "Semiconductors" },
  { symbol: "CRM", name: "Salesforce", sector: "Software" },
  { symbol: "ORCL", name: "Oracle", sector: "Software" },
  { symbol: "DIS", name: "Disney", sector: "Media" },
  { symbol: "NKE", name: "Nike", sector: "Apparel" },
  { symbol: "SBUX", name: "Starbucks", sector: "Restaurants" },
  { symbol: "MCD", name: "McDonald's", sector: "Restaurants" },
  { symbol: "KO", name: "Coca-Cola", sector: "Beverages" },
  { symbol: "PEP", name: "PepsiCo", sector: "Beverages" },
  { symbol: "WMT", name: "Walmart", sector: "Retail" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Banking" },
  { symbol: "V", name: "Visa", sector: "Payments" },
  { symbol: "MA", name: "Mastercard", sector: "Payments" },
  { symbol: "PYPL", name: "PayPal", sector: "Payments" },
  { symbol: "BA", name: "Boeing", sector: "Aerospace" },
  { symbol: "XOM", name: "ExxonMobil", sector: "Energy" },
];
