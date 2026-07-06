export interface ExamQuestion {
  id: number;
  question: string;
  options: string[];
  correctIndex: number;
}

export const EXAM_QUESTIONS: ExamQuestion[] = [
  {
    id: 1,
    question: "What is a stock?",
    options: [
      "A loan you give to a company",
      "A share of ownership in a company",
      "A type of bond",
      "An insurance policy",
    ],
    correctIndex: 1,
  },
  {
    id: 2,
    question: "What does 'IPO' stand for?",
    options: [
      "Internal Profit Operation",
      "Initial Public Offering",
      "Indexed Portfolio Option",
      "International Price Order",
    ],
    correctIndex: 1,
  },
  {
    id: 3,
    question: "What is a dividend?",
    options: [
      "A fee charged by your broker",
      "A portion of a company's profits paid to shareholders",
      "A penalty for selling stocks early",
      "The price at which a stock is listed",
    ],
    correctIndex: 1,
  },
  {
    id: 4,
    question: "What does P/E ratio measure?",
    options: [
      "Profit / Equity",
      "Price / Earnings",
      "Portfolio / Expenses",
      "Performance / Estimation",
    ],
    correctIndex: 1,
  },
  {
    id: 5,
    question: "What is a 'bear market'?",
    options: [
      "A market with rapidly rising prices",
      "A market dominated by technology stocks",
      "A market experiencing prolonged price declines of 20% or more",
      "A market open only on weekdays",
    ],
    correctIndex: 2,
  },
  {
    id: 6,
    question: "What is a 'bull market'?",
    options: [
      "A market experiencing prolonged price increases",
      "A market with declining prices",
      "A market that trades only in commodities",
      "A market with high volatility",
    ],
    correctIndex: 0,
  },
  {
    id: 7,
    question: "What is diversification?",
    options: [
      "Putting all your money into one stock",
      "Spreading investments across different assets to reduce risk",
      "Trading stocks every day",
      "Only investing in technology companies",
    ],
    correctIndex: 1,
  },
  {
    id: 8,
    question: "What is a limit order?",
    options: [
      "An order that executes immediately at the current price",
      "An order to buy/sell only at a specific price or better",
      "An order limited to 100 shares",
      "An order that cancels at end of day",
    ],
    correctIndex: 1,
  },
  {
    id: 9,
    question: "What is market capitalization?",
    options: [
      "The total amount of debt a company holds",
      "The number of employees in a company",
      "The total market value of a company's outstanding shares",
      "The amount of money a company has in the bank",
    ],
    correctIndex: 2,
  },
  {
    id: 10,
    question: "What does it mean to 'short sell' a stock?",
    options: [
      "Selling a stock you already own",
      "Borrowing shares to sell them, hoping to buy them back cheaper later",
      "Selling shares within one hour of buying them",
      "Selling shares at a loss",
    ],
    correctIndex: 1,
  },
  {
    id: 11,
    question: "What is an ETF (Exchange-Traded Fund)?",
    options: [
      "A type of savings account",
      "A fund that holds a basket of assets and trades like a stock",
      "A government bond",
      "A certificate of deposit",
    ],
    correctIndex: 1,
  },
  {
    id: 12,
    question: "What is a stop-loss order?",
    options: [
      "An order to buy at a certain price",
      "An order to automatically sell when a stock drops to a certain price",
      "An order that increases your position size",
      "An order that can only be placed after hours",
    ],
    correctIndex: 1,
  },
  {
    id: 13,
    question: "What is a stock's 'volume'?",
    options: [
      "The total number of shares that exist",
      "The loudness of trading floor activity",
      "The number of shares traded in a given period",
      "The price range of a stock over a day",
    ],
    correctIndex: 2,
  },
  {
    id: 14,
    question: "What is margin trading?",
    options: [
      "Trading only on the margins of the market (before open / after close)",
      "Borrowing money from a broker to buy stocks",
      "Trading with zero commission",
      "Trading only small-cap stocks",
    ],
    correctIndex: 1,
  },
  {
    id: 15,
    question: "What is a call option?",
    options: [
      "An obligation to sell shares at a set price",
      "The right, but not the obligation, to buy shares at a set price by a certain date",
      "A phone call to your broker",
      "A type of bond that pays monthly",
    ],
    correctIndex: 1,
  },
  {
    id: 16,
    question: "What is a put option?",
    options: [
      "The right, but not the obligation, to sell shares at a set price by a certain date",
      "An obligation to buy shares at market price",
      "Putting money into a savings account",
      "A type of mutual fund",
    ],
    correctIndex: 0,
  },
  {
    id: 17,
    question: "What does 'blue chip' stock refer to?",
    options: [
      "Stocks that are painted blue on the trading screen",
      "Shares of small startup companies",
      "Shares of large, well-established, financially stable companies",
      "Stocks that have recently dropped in value",
    ],
    correctIndex: 2,
  },
  {
    id: 18,
    question: "What is dollar-cost averaging?",
    options: [
      "Investing a fixed dollar amount at regular intervals regardless of price",
      "Only buying stocks priced under $1",
      "Converting all investments to US dollars",
      "Averaging the dollar value of your portfolio",
    ],
    correctIndex: 0,
  },
  {
    id: 19,
    question: "What is the S&P 500?",
    options: [
      "A savings plan with a 500% return",
      "An index that tracks 500 of the largest U.S. publicly traded companies",
      "A portfolio of exactly 500 shares",
      "A stock that costs $500 per share",
    ],
    correctIndex: 1,
  },
  {
    id: 20,
    question: "What is fundamental analysis?",
    options: [
      "Analyzing chart patterns and price trends",
      "Evaluating a company's financial health, earnings, and business model to determine stock value",
      "Using social media sentiment to trade",
      "Only looking at a stock's daily price",
    ],
    correctIndex: 1,
  },
];
