"""
The curriculum. Each level is content + an unlock rule.
Editing the game = editing this list. No other code changes needed
to add a new lesson.
"""

LEVELS = [
    {
        "id": 1,
        "title": "What Is a Stock?",
        "description": "Learn what you actually own when you buy a share.",
        "lesson": (
            "A stock represents a fractional ownership interest in a company. When you buy one share "
            "of a company like Apple (AAPL), you literally own a tiny piece of Apple itself — its profits, "
            "its factories, its cash, and its future. \n\n"
            "Real-Life Example: Imagine you and three friends start a lemonade stand. Each of you puts in $25. "
            "The stand is worth $100, and there are 4 'shares' (each worth $25). You each own 25% of the business. "
            "If the lemonade stand makes a lot of money and becomes worth $1,000, your single share is now worth $250. "
            "That's exactly how the stock market works, just on a scale of billions of dollars and millions of shares.\n\n"
            "Prices fluctuate simply because buyers and sellers constantly disagree on what that slice of ownership is worth right now based on news, earnings, or even just emotions.\n\n"
            "Your mission: Buy 1 share of any real company using your $100,000 in practice cash. Watch how its price moves."
        ),
        "unlocks": ["market_orders"],
        "xp_reward": 50,
    },
    {
        "id": 2,
        "title": "The Stock Market: How it Works",
        "description": "The invisible engine where buyers meet sellers.",
        "lesson": (
            "The stock market isn't a single magical entity; it's a collection of exchanges (like the New York Stock Exchange or NASDAQ) "
            "where buyers and sellers come together to trade shares. It functions just like an auction.\n\n"
            "Real-Life Example: Think of it like a massive digital farmer's market. A farmer brings their apples (shares of stock). "
            "One customer says 'I'll buy an apple for $1.00.' The farmer says 'No, I want $1.10.' Another customer walks up and says "
            "'I'll pay $1.10!' Boom. A trade happens. The 'last traded price' of an apple is now officially $1.10. Millions of these "
            "mini-auctions happen every second in the stock market.\n\n"
            "When you see a stock price ticking up and down, you are seeing the result of real human beings (and algorithms) agreeing on a price."
        ),
        "unlocks": [],
        "xp_reward": 50,
    },
    {
        "id": 3,
        "title": "Market vs. Limit Orders",
        "description": "The two basic ways to place a trade.",
        "lesson": (
            "When buying or selling, you have to tell your broker HOW to execute the trade. \n\n"
            "A Market Order buys or sells immediately at the current best available price. It guarantees your order will go through, "
            "but it DOES NOT guarantee the price. \n\n"
            "A Limit Order sets the exact price you're willing to pay (or accept), and only executes if the market reaches it. "
            "It guarantees the price, but DOES NOT guarantee the order will go through.\n\n"
            "Real-Life Example: Imagine buying a used car. A Market Order is walking into the dealership and saying 'I'll take that car "
            "right now for whatever your asking price is.' A Limit Order is saying 'I will only buy that car if you drop the price to $15,000.' "
            "If they don't drop the price, you don't get the car.\n\n"
            "Your mission: place one limit order below the current market price."
        ),
        "unlocks": ["limit_orders"],
        "xp_reward": 75,
    },
    {
        "id": 4,
        "title": "Brokers and Exchanges",
        "description": "Where trades actually happen and who facilitates them.",
        "lesson": (
            "You cannot walk directly into the NASDAQ and buy a stock. You need a middleman. That middleman is a Broker (like Robinhood, Fidelity, or Charles Schwab).\n\n"
            "The Broker routes your order to an Exchange (like NYSE or NASDAQ). The Exchange matches your buy order with someone else's sell order.\n\n"
            "Real-Life Example: If you want to buy a house, you don't usually knock on every door in the neighborhood. You use a Real Estate Agent (the Broker). "
            "The agent looks at the Multiple Listing Service (the Exchange) to find houses for sale. They handle the complex routing and paperwork for you."
        ),
        "unlocks": [],
        "xp_reward": 50,
    },
    {
        "id": 5,
        "title": "Reading a Price Chart",
        "description": "Candlesticks, and what the shape of a chart tells you.",
        "lesson": (
            "Traders use Candlestick charts because they show a lot of information at a glance. Each candlestick represents a specific timeframe (e.g., 1 day, 1 hour, or 5 minutes) "
            "and shows four key numbers: Open (first price), High (highest price), Low (lowest price), and Close (last price).\n\n"
            "- Green Candle: The close was HIGHER than the open. The price went up.\n"
            "- Red Candle: The close was LOWER than the open. The price went down.\n\n"
            "Real-Life Example: Think of a 1-day candle like the summary of a sports game. The Open is the score at the start. The High/Low are the biggest leads "
            "either team had during the game. The Close is the final score. The 'wick' (the thin lines at the top/bottom of the candle) show how wild the game got before settling down.\n\n"
            "Your mission: open the chart for any stock you own."
        ),
        "unlocks": ["charting"],
        "xp_reward": 75,
    },
    {
        "id": 6,
        "title": "Trends & Support/Resistance",
        "description": "Basic chart patterns and market memory.",
        "lesson": (
            "Stocks don't move in straight lines; they move in zig-zags. An uptrend is a series of 'higher highs' and 'higher lows'. A downtrend is 'lower highs' and 'lower lows'.\n\n"
            "Support is a price level where a stock has historically stopped falling and bounced back up (buyers step in). "
            "Resistance is a price level where a stock has historically stopped rising and fallen back down (sellers step in).\n\n"
            "Real-Life Example: Think of Support as the floor of a room and Resistance as the ceiling. A bouncing rubber ball (the stock price) "
            "hits the floor and bounces up, hits the ceiling and bounces down. Eventually, if it hits the ceiling hard enough, it might break through to the floor above!"
        ),
        "unlocks": [],
        "xp_reward": 75,
    },
    {
        "id": 7,
        "title": "Volume",
        "description": "Understanding trade quantities and conviction.",
        "lesson": (
            "Volume is the total number of shares traded during a specific time period. It is the 'fuel' behind a price move.\n\n"
            "If a stock goes up on HIGH volume, it means there is strong conviction behind the move (many big players are buying). "
            "If it goes up on LOW volume, the move might be weak and could easily reverse.\n\n"
            "Real-Life Example: Imagine a restaurant with a 5-star review. If 1 person left that review (low volume), it might just be the owner's mom. "
            "But if 10,000 people left 5-star reviews (high volume), you can be confident the food is actually good."
        ),
        "unlocks": [],
        "xp_reward": 75,
    },
    {
        "id": 8,
        "title": "Market Cap & Outstanding Shares",
        "description": "How much a company is truly worth.",
        "lesson": (
            "A stock's price alone tells you almost NOTHING about the size of a company. To know a company's true size, you look at its Market Capitalization (Market Cap).\n\n"
            "Market Cap = Stock Price × Total Number of Shares Outstanding.\n\n"
            "Real-Life Example: Imagine two pizzas. Pizza A costs $2 a slice, but is cut into 4 slices (Total Value: $8). "
            "Pizza B costs $1 a slice, but is cut into 20 slices (Total Value: $20). Even though Pizza A has a higher 'share price', Pizza B is the bigger, more valuable company."
        ),
        "unlocks": [],
        "xp_reward": 100,
    },
    {
        "id": 9,
        "title": "Dividends & Yields",
        "description": "Getting paid just to hold a stock.",
        "lesson": (
            "A dividend is a cash reward paid by a company to its shareholders out of its profits. Not all companies pay dividends (growth companies usually reinvest profits instead), "
            "but mature companies often do.\n\n"
            "Dividend Yield is the annual dividend divided by the stock price, expressed as a percentage. It tells you how much cash you make just by holding.\n\n"
            "Real-Life Example: If you buy a rental property for $100,000 and collect $5,000 a year in rent, your 'yield' is 5%. "
            "If you buy $100,000 of Coca-Cola stock and they pay you $3,000 a year in dividends, your yield is 3%. You get this cash regardless of what the stock price does."
        ),
        "unlocks": [],
        "xp_reward": 100,
    },
    {
        "id": 10,
        "title": "Earnings Reports & EPS",
        "description": "Measuring company profitability.",
        "lesson": (
            "Every three months (quarterly), public companies are required by law to report how much money they made or lost. These are called Earnings Reports.\n\n"
            "The most important metric is EPS (Earnings Per Share). It is the company's total profit divided by the number of shares.\n\n"
            "Real-Life Example: If Tesla makes $1 Billion in profit, and has 1 Billion shares, its EPS is $1.00. Wall Street analysts "
            "always try to 'guess' the EPS before the report comes out. If the company reports $1.10 (a 'beat'), the stock often rockets up. "
            "If they report $0.90 (a 'miss'), the stock often crashes. Earnings season is the most volatile time in the market."
        ),
        "unlocks": [],
        "xp_reward": 100,
    },
    {
        "id": 11,
        "title": "P/E Ratios",
        "description": "Valuation basics: Is a stock cheap or expensive?",
        "lesson": (
            "The P/E Ratio (Price-to-Earnings Ratio) is the most common way to value a stock. It tells you how much you are paying for $1 of the company's profit.\n\n"
            "P/E = Stock Price / Earnings Per Share (EPS).\n\n"
            "Real-Life Example: If a local bakery generates $100,000 in profit a year, and the owner offers to sell you the whole business for $1,000,000, "
            "the P/E ratio is 10. You are paying 10 times its annual earnings. If they wanted $5,000,000, the P/E is 50 (very expensive!). "
            "A high P/E means investors expect massive future growth. A low P/E means the company is mature, or people think it's dying."
        ),
        "unlocks": [],
        "xp_reward": 125,
    },
    {
        "id": 12,
        "title": "Growth vs. Value Stocks",
        "description": "Different investing styles.",
        "lesson": (
            "Stocks generally fall into two broad categories:\n\n"
            "Growth Stocks: Companies growing their revenue and profits very fast (like tech companies). They often don't pay dividends, "
            "have very high P/E ratios, and can be highly volatile.\n\n"
            "Value Stocks: Established companies that trade at a low price relative to their fundamentals (low P/E). They are usually slower-growing, "
            "often pay steady dividends, and are considered 'safer'.\n\n"
            "Real-Life Example: Buying a hot new tech startup that is burning cash to conquer the world is a Growth play. Buying an established "
            "railroad company that quietly prints money every year is a Value play."
        ),
        "unlocks": [],
        "xp_reward": 100,
    },
    {
        "id": 13,
        "title": "Diversification",
        "description": "Why 'don't put all your eggs in one basket' is a real strategy.",
        "lesson": (
            "If all your money is in one stock, one bad headline can wipe out a huge chunk of your portfolio. "
            "Spreading money across different companies and sectors reduces that risk.\n\n"
            "Real-Life Example: Imagine you run a shop that ONLY sells umbrellas. On rainy days, you make a fortune. On sunny days, you go bankrupt. "
            "If you diversify and sell umbrellas AND sunglasses, you make money no matter the weather. That is why you buy Tech stocks AND Healthcare stocks.\n\n"
            "Your mission: hold positions in at least 3 different companies from different industries."
        ),
        "unlocks": ["multi_position_view"],
        "xp_reward": 100,
    },
    {
        "id": 14,
        "title": "Index Funds & ETFs",
        "description": "Buying the whole market at once.",
        "lesson": (
            "Picking individual stocks is hard. An ETF (Exchange Traded Fund) allows you to buy a basket of hundreds of stocks with a single trade.\n\n"
            "The most famous is the S&P 500 (ticker: SPY or VOO), which contains the 500 largest US companies. When you buy 1 share of SPY, "
            "you instantly own a tiny piece of Apple, Microsoft, Amazon, and 497 other companies.\n\n"
            "Real-Life Example: Instead of trying to guess which runner will win a marathon, an ETF lets you bet on ALL the runners. "
            "You won't get rich overnight, but historically, the S&P 500 has averaged about a 10% return per year over decades."
        ),
        "unlocks": [],
        "xp_reward": 100,
    },
    {
        "id": 15,
        "title": "Risk & Position Sizing",
        "description": "Protecting your capital so you stay in the game.",
        "lesson": (
            "Professional traders focus on risk first, profits second. They often risk only 1-2% of their total account on a single idea.\n\n"
            "Position sizing is the discipline of deciding 'how much' before you decide 'what.'\n\n"
            "Real-Life Example: If you go to a casino with $10,000 and put it all on one hand of Blackjack, you have a 50% chance of going home broke in 5 minutes. "
            "If you bet $100 per hand, you can play all night, learn the game, and let probability work for you.\n\n"
            "Your mission: make a trade where the position is less than 10% of your total account value."
        ),
        "unlocks": ["risk_meter"],
        "xp_reward": 125,
    },
    {
        "id": 16,
        "title": "Short Selling",
        "description": "Profiting when a stock goes down, not up.",
        "lesson": (
            "Short selling means borrowing shares from your broker, selling them now at a high price, and buying them back later at a lower price "
            "so you can return them. You keep the difference.\n\n"
            "Real-Life Example: Imagine your friend has a rare comic book worth $100. You think the price is going to crash. You borrow the comic from your friend "
            "and immediately sell it to a stranger for $100. Next week, the price crashes to $20. You buy a copy for $20, give it back to your friend, and pocket an $80 profit!\n\n"
            "Warning: If a stock goes UP, your losses are theoretically unlimited. Short selling is highly advanced.\n\n"
            "This mission is a scenario simulation only."
        ),
        "unlocks": ["short_selling_sim"],
        "xp_reward": 150,
    },
    {
        "id": 17,
        "title": "Margin & Leverage",
        "description": "Trading with borrowed money.",
        "lesson": (
            "Margin is a loan from your broker that allows you to buy more stock than you have cash for. This is called Leverage.\n\n"
            "Real-Life Example: You have $50,000. Your broker gives you 2x Margin, so you can buy $100,000 worth of stock. "
            "If the stock goes up 10%, you make $10,000 (a 20% return on your original cash). BUT if the stock drops 50%, "
            "your $100,000 position is now worth $50,000. You owe the broker $50,000. You have lost 100% of your money. This is a 'Margin Call'.\n\n"
            "Leverage is a double-edged sword that amplifies both gains and destruction."
        ),
        "unlocks": [],
        "xp_reward": 150,
    },
    {
        "id": 18,
        "title": "Moving Averages",
        "description": "Smoothing out price action to spot the trend.",
        "lesson": (
            "A Moving Average (MA) is a technical indicator that calculates the average price of a stock over a specific number of days. "
            "It smooths out daily noise to reveal the true trend.\n\n"
            "The 200-day MA is used for long-term trends. If a stock is above its 200-day MA, it's generally in a bull market. "
            "The 50-day MA is used for medium-term trends.\n\n"
            "Real-Life Example: A thermometer outside your window jumps wildly between day and night (daily stock price). "
            "But the average temperature over the last 30 days (Moving Average) slowly curves to tell you if Winter or Summer is approaching."
        ),
        "unlocks": [],
        "xp_reward": 125,
    },
    {
        "id": 19,
        "title": "RSI & MACD",
        "description": "Measuring momentum and identifying overbought/oversold extremes.",
        "lesson": (
            "The RSI (Relative Strength Index) measures the speed and change of price movements on a scale of 0 to 100. "
            "Above 70 is considered 'Overbought' (due for a pullback). Below 30 is 'Oversold' (due for a bounce).\n\n"
            "The MACD (Moving Average Convergence Divergence) shows the relationship between two moving averages. When they cross, it can signal a change in momentum.\n\n"
            "Real-Life Example: Think of RSI like a car's speedometer. A stock price can keep going up, but if the RSI starts dropping, it means the driver "
            "has taken their foot off the gas pedal. The car is still moving forward, but it's losing momentum and might soon stop."
        ),
        "unlocks": [],
        "xp_reward": 125,
    },
    {
        "id": 20,
        "title": "Fundamental Analysis",
        "description": "Reading the balance sheet to find true value.",
        "lesson": (
            "While Technical Analysis (charts) looks at price movement, Fundamental Analysis looks at the actual business. "
            "You examine Revenue, Net Income, Debt, and Cash Flow.\n\n"
            "A healthy company has growing revenue, expanding profit margins, and low debt. A sick company burns cash to stay alive.\n\n"
            "Real-Life Example: You wouldn't buy a local pizza shop just because it has a long line out the door (Technical/Momentum). "
            "You would ask to see their accounting books to make sure the rent isn't so high that they are actually losing money on every pizza (Fundamentals)."
        ),
        "unlocks": [],
        "xp_reward": 150,
    },
    {
        "id": 21,
        "title": "Introduction to Options: Calls",
        "description": "The right to buy at a specific price.",
        "lesson": (
            "An Option is a contract that gives you the right (but not the obligation) to buy or sell a stock at a specific price by a specific date.\n\n"
            "A CALL option gives you the right to BUY. You buy a Call if you think the stock will go UP.\n\n"
            "Real-Life Example: You see a house worth $300k. You think a new highway will make it worth $500k next year. You pay the owner $5k for a contract "
            "that gives you the right to buy the house for $300k anytime in the next year. If the house goes to $500k, your $5k contract is now massively valuable! "
            "If the house price drops, you just walk away and lose your $5k fee."
        ),
        "unlocks": [],
        "xp_reward": 175,
    },
    {
        "id": 22,
        "title": "Introduction to Options: Puts",
        "description": "The right to sell, or insuring your portfolio.",
        "lesson": (
            "A PUT option gives you the right to SELL a stock at a specific price. You buy a Put if you think the stock will go DOWN, or to protect stocks you already own.\n\n"
            "Real-Life Example: You own a $50,000 car. You pay an insurance company $1,000 for a policy (a Put Option). If the car is totaled (stock crashes to $0), "
            "the insurance contract gives you the right to 'sell' your destroyed car to them for $50,000. \n\n"
            "Options decay in value as time passes. If your car doesn't crash before the year ends, the insurance contract expires worthless."
        ),
        "unlocks": [],
        "xp_reward": 175,
    },
    {
        "id": 23,
        "title": "Market Psychology",
        "description": "Fear, greed, and mastering your own mind.",
        "lesson": (
            "The hardest part of trading isn't math; it's emotions. The market is driven by Fear (panic selling at the bottom) and Greed (FOMO buying at the top).\n\n"
            "FOMO stands for Fear Of Missing Out. It's the urge to buy a stock that has already skyrocketed just because your friends are making money on it.\n\n"
            "Real-Life Example: Warren Buffett famously said, 'Be fearful when others are greedy, and greedy when others are fearful.' "
            "The best investors buy when there is 'blood in the streets' and sell when cab drivers are giving out stock tips."
        ),
        "unlocks": [],
        "xp_reward": 150,
    },
    {
        "id": 24,
        "title": "Trading Styles",
        "description": "Day trading vs. Swing trading vs. Investing.",
        "lesson": (
            "You must choose a style that fits your personality and schedule.\n\n"
            "1. Day Trading: Buying and selling within the same day. Highly stressful, requires constant screen time, entirely technical.\n"
            "2. Swing Trading: Holding for a few days to a few weeks. Trying to catch medium-term price swings.\n"
            "3. Investing: Holding for years or decades. Ignoring daily noise and focusing entirely on business fundamentals.\n\n"
            "Real-Life Example: A Day Trader is a cheetah sprinting for a quick kill. An Investor is a farmer planting seeds and waiting years for the orchard to grow."
        ),
        "unlocks": [],
        "xp_reward": 150,
    },
    {
        "id": 25,
        "title": "Developing a Trading Plan",
        "description": "Putting it all together to become a pro.",
        "lesson": (
            "A professional trader never enters a trade without a Plan. A Trading Plan answers three questions before you even click the buy button:\n\n"
            "1. Exactly what criteria triggers my entry?\n"
            "2. Where exactly is my Stop Loss (where do I admit I was wrong and take a small loss)?\n"
            "3. Where is my Profit Target?\n\n"
            "Real-Life Example: An amateur gets into a trade because they 'have a good feeling' and freezes when the stock drops. "
            "A pro says, 'I am buying at $100. If it drops to $95, the system automatically sells to protect me. If it hits $120, I take my profit.'\n\n"
            "Congratulations. You've learned the path. Now it's time to walk it."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 26,
        "title": "Understanding VWAP",
        "description": "The institutional trader's favorite metric.",
        "lesson": (
            "VWAP stands for Volume Weighted Average Price. It shows the average price a stock has traded at throughout the day, based on both volume and price.\n\n"
            "Institutions (like mutual funds) use VWAP to ensure they aren't paying too much when buying millions of shares. If they buy below VWAP, they consider it a 'good execution'.\n\n"
            "Real-Life Example: If a stock opens at $10, shoots to $20 on low volume, and drops to $12 on high volume, the simple average is $15. But the VWAP will be much closer to $12 because that's where most of the trading actually happened."
        ),
        "unlocks": [],
        "xp_reward": 150,
    },
    {
        "id": 27,
        "title": "Fibonacci Retracements",
        "description": "Nature's mathematical ratios in the stock market.",
        "lesson": (
            "Traders use the Fibonacci sequence (23.6%, 38.2%, 50%, 61.8%) to identify potential support and resistance levels during a pullback.\n\n"
            "If a stock surges from $10 to $20, it will rarely stay at $20. It usually 'retraces' part of the move before continuing. "
            "Traders look for the price to bounce off the 50% or 61.8% lines.\n\n"
            "Real-Life Example: It's a self-fulfilling prophecy. Because so many algorithms and traders are looking at the 50% retracement line, they all place their buy orders there, causing the price to actually bounce!"
        ),
        "unlocks": [],
        "xp_reward": 175,
    },
    {
        "id": 28,
        "title": "The Bull Trap",
        "description": "A false breakout that catches eager buyers.",
        "lesson": (
            "A Bull Trap happens when a declining stock breaks above a key resistance level, convincing buyers that the downtrend is over. As soon as buyers pile in, "
            "large institutions aggressively sell their shares into that buying pressure, causing the price to crash back down.\n\n"
            "Real-Life Example: Imagine a store advertises 'New PS5 in stock!' A crowd rushes in, hands over their cash, and the manager locks the doors and runs away with the money. "
            "You were trapped by the illusion of a breakout."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 29,
        "title": "The Bear Trap",
        "description": "A false breakdown that shakes out weak hands.",
        "lesson": (
            "A Bear Trap is the exact opposite. A stock drops slightly below a major support level. Retail traders panic and sell their shares, or short sellers pile in. "
            "But it was a trick—institutions use that panic to buy millions of shares at a discount. The stock immediately reverses and skyrockets.\n\n"
            "Real-Life Example: It's like a fake fire drill. Everyone drops what they are doing and runs out of the building in panic, while the smart money walks in and claims all the free desks."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 30,
        "title": "Level II Data & Order Flow",
        "description": "Looking inside the matrix.",
        "lesson": (
            "Basic charts show you past trades. Level II data shows you FUTURE intent. It displays the 'Order Book'—the real-time list of all limit orders waiting to be filled at various prices.\n\n"
            "If you see 1,000 shares waiting to buy at $10, and 500,000 shares waiting to sell at $11, you know there is massive resistance ahead.\n\n"
            "Real-Life Example: It's like having x-ray vision in a poker game. You can literally see how many chips the other players are getting ready to bet before they even put them on the table."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 31,
        "title": "Wash Sales & Taxes",
        "description": "Don't let the IRS ruin your strategy.",
        "lesson": (
            "If you sell a stock for a loss to claim a tax deduction, but buy that exact same stock back within 30 days, the IRS considers it a 'Wash Sale'. "
            "You are legally NOT allowed to claim that loss on your taxes.\n\n"
            "Real-Life Example: Imagine selling your losing lottery ticket to your brother to claim a tax loss, and then buying it right back the next day. The government isn't stupid; they know what you're doing, and they forbid it."
        ),
        "unlocks": [],
        "xp_reward": 150,
    },
    {
        "id": 32,
        "title": "10-K and 10-Q Filings",
        "description": "The ultimate truth about a company.",
        "lesson": (
            "Public companies must file a 10-Q (quarterly) and a 10-K (annual) report with the SEC. These documents contain the raw, audited financial truth, bypassing the CEO's marketing hype.\n\n"
            "The most important section is 'Risk Factors'. Here, companies are legally forced to admit everything that could destroy their business.\n\n"
            "Real-Life Example: The CEO goes on TV and says 'Our growth is spectacular!' But you read the 10-K and see that their cash reserves dropped by 80% and their main supplier just went bankrupt. Always read the filings."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 33,
        "title": "The Pattern Day Trader Rule (PDT)",
        "description": "The $25,000 barrier.",
        "lesson": (
            "By US law (FINRA), if your margin account has less than $25,000, you are legally restricted to making no more than 3 'day trades' (buying and selling the same stock in a single day) within a 5-day period.\n\n"
            "If you break this rule, your account will be frozen for 90 days. This is designed to 'protect' small investors from high-risk day trading.\n\n"
            "Real-Life Example: It's like a roller coaster that says 'You must be this tall to ride.' If you have under $25k, you must use a Cash Account or switch to Swing Trading."
        ),
        "unlocks": [],
        "xp_reward": 150,
    },
    {
        "id": 34,
        "title": "Interest Rates & The Fed",
        "description": "The gravity of the stock market.",
        "lesson": (
            "The Federal Reserve sets the baseline interest rate for the economy. When rates are LOW, borrowing money is cheap, businesses expand, and the stock market generally goes up (bull market).\n\n"
            "When rates go UP, borrowing becomes expensive, businesses slow down, and investors move their money from risky stocks to safe bonds (bear market).\n\n"
            "Real-Life Example: Interest rates are like the gravity of the financial world. If gravity is weak, stocks can float to the moon. If gravity is turned up heavy, everything gets pulled back down to earth."
        ),
        "unlocks": [],
        "xp_reward": 225,
    },
    {
        "id": 35,
        "title": "Inflation & CPI",
        "description": "The silent portfolio killer.",
        "lesson": (
            "Inflation is the rate at which the cost of goods increases. The CPI (Consumer Price Index) measures this monthly.\n\n"
            "If inflation is 5%, your cash loses 5% of its purchasing power every year. To simply break even, your stock portfolio MUST return at least 5%.\n\n"
            "Real-Life Example: You keep $10,000 under your mattress for 20 years. When you take it out, you still have 10,000 bills, but a loaf of bread now costs $25. You lost all your wealth without spending a dime."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 36,
        "title": "Beta and Volatility",
        "description": "Measuring a stock's wildness.",
        "lesson": (
            "Beta measures how volatile a stock is compared to the overall market (S&P 500). "
            "A Beta of 1.0 means the stock moves exactly with the market. A Beta of 2.0 means the stock is twice as volatile (it goes up twice as fast, but crashes twice as hard).\n\n"
            "Real-Life Example: The market is a normal passenger car on the highway (Beta = 1). A high-beta tech stock is a Formula 1 car (Beta = 3) — incredibly fast, but much more likely to crash."
        ),
        "unlocks": [],
        "xp_reward": 175,
    },
    {
        "id": 37,
        "title": "Options Implied Volatility (IV)",
        "description": "The hidden price tag on options.",
        "lesson": (
            "When you buy an option, you don't just pay for the stock price. You pay for 'Implied Volatility' (IV) — the market's expectation of how wild the stock will swing.\n\n"
            "If IV is high (e.g., right before an earnings report), options become extremely expensive. This leads to the infamous 'IV Crush', where the stock goes the way you predicted, but your option still loses value because the volatility disappeared.\n\n"
            "Real-Life Example: Buying flood insurance during a hurricane costs a fortune (High IV). Buying it on a sunny day is cheap (Low IV)."
        ),
        "unlocks": [],
        "xp_reward": 250,
    },
    {
        "id": 38,
        "title": "The Greeks: Delta & Theta",
        "description": "The physics of options trading.",
        "lesson": (
            "Delta measures how much the option price changes for every $1 the stock moves. A Delta of 0.50 means if the stock goes up $1, your option goes up $0.50.\n\n"
            "Theta measures time decay. It is the amount of money your option loses every single day it gets closer to expiration.\n\n"
            "Real-Life Example: Theta is an ice cube melting in the sun. Even if the stock price does nothing, the ice cube (your option's value) gets smaller every second until it's gone."
        ),
        "unlocks": [],
        "xp_reward": 250,
    },
    {
        "id": 39,
        "title": "Short Squeezes",
        "description": "When bears get trapped and ignite a rocket.",
        "lesson": (
            "When too many people short-sell a stock, they must eventually buy it back to close their position. If the stock suddenly starts going UP instead of down, "
            "these short sellers panic and buy shares rapidly to cover their losses. This massive wave of forced buying shoots the stock price to the moon.\n\n"
            "Real-Life Example: This is exactly what happened with GameStop (GME) in 2021. Hedge funds were trapped, retail traders refused to sell, and the forced buying sent the stock up thousands of percent."
        ),
        "unlocks": [],
        "xp_reward": 225,
    },
    {
        "id": 40,
        "title": "Dark Pools",
        "description": "Where the whales trade in secret.",
        "lesson": (
            "A Dark Pool is a private exchange where large institutions trade massive blocks of shares off the public market. "
            "They do this so their massive orders don't instantly crash or spike the public stock price before they finish buying/selling.\n\n"
            "Real-Life Example: If you want to sell 10 million shares of Apple, doing it on the public market would cause a panic. Doing it in a Dark Pool lets you quietly hand the shares to another billionaire behind closed doors."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 41,
        "title": "Algorithmic & High-Frequency Trading (HFT)",
        "description": "The robots running the show.",
        "lesson": (
            "Over 70% of all stock market trades are made by computer algorithms, not humans. High-Frequency Trading (HFT) firms use supercomputers located right next to the exchange "
            "to execute millions of trades in fractions of a microsecond, profiting off microscopic price differences.\n\n"
            "Real-Life Example: You place an order to buy at $10.00. An HFT algorithm sees your order coming, buys the stock at $9.99, and instantly sells it to you for $10.00 a microsecond later, pocketing a penny. Now multiply that by a billion."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 42,
        "title": "Dollar-Cost Averaging vs Lump Sum",
        "description": "The mathematical debate.",
        "lesson": (
            "If you have $10,000, should you put it all in the market today (Lump Sum), or put in $1,000 a month for 10 months (DCA)?\n\n"
            "Mathematically, because the market goes up over the long term, Lump Sum investing beats DCA about 66% of the time. However, DCA provides psychological safety against investing right before a crash.\n\n"
            "Real-Life Example: It's the difference between jumping into a cold pool all at once vs slowly walking down the steps. The jump is statistically better, but the steps are less scary."
        ),
        "unlocks": [],
        "xp_reward": 175,
    },
    {
        "id": 43,
        "title": "Sector Rotation",
        "description": "Following the money as the economy changes.",
        "lesson": (
            "Big money constantly rotates between different sectors (Tech, Healthcare, Energy, Financials) depending on the economic cycle.\n\n"
            "During a recession, they rotate into 'Defensive' sectors like Utilities and Consumer Staples (people still need electricity and toothpaste). During a boom, they rotate into 'Cyclical' sectors like Tech and Travel.\n\n"
            "Real-Life Example: The stock market is a game of musical chairs. The money never disappears, it just moves from one chair to another. Your job is to sit where the money is going next."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 44,
        "title": "The VIX (Volatility Index)",
        "description": "The market's 'Fear Gauge'.",
        "lesson": (
            "The VIX tracks the implied volatility of S&P 500 options. When the VIX is low (under 15), the market is calm and complacent. When the VIX spikes (over 30), it indicates extreme fear and panic.\n\n"
            "Traders often say: 'When the VIX is high, it's time to buy. When the VIX is low, look out below.'\n\n"
            "Real-Life Example: The VIX is a seismograph for earthquakes. A flat line means a peaceful sunny day. A jagged spike means everyone is running for their lives."
        ),
        "unlocks": [],
        "xp_reward": 225,
    },
    {
        "id": 45,
        "title": "Bonds and Yield Curves",
        "description": "The bond market is the stock market's big brother.",
        "lesson": (
            "A bond is a loan you give to a government or corporation. The Yield Curve plots interest rates of short-term vs long-term bonds. "
            "Normally, long-term bonds pay higher interest. But when the curve 'Inverts' (short-term pays more than long-term), it historically signals an impending recession.\n\n"
            "Real-Life Example: If a bank pays you more interest to lock up your money for 1 year than for 10 years, they are terrified of the near future. The stock market usually catches that fear."
        ),
        "unlocks": [],
        "xp_reward": 250,
    },
    {
        "id": 46,
        "title": "Stock Splits and Reverse Splits",
        "description": "Slicing the pizza.",
        "lesson": (
            "A Stock Split (e.g., 4-for-1) cuts the stock price by a factor of 4, but gives you 4 times as many shares. The total value remains EXACTLY the same. Companies do this to make shares look 'cheaper' and more accessible.\n\n"
            "A Reverse Split does the opposite, usually to prevent a failing company from being delisted from the exchange.\n\n"
            "Real-Life Example: You have a $20 bill. The bank gives you four $5 bills instead. You are no richer or poorer, your wallet just looks thicker."
        ),
        "unlocks": [],
        "xp_reward": 150,
    },
    {
        "id": 47,
        "title": "Insider Trading & SEC Forms",
        "description": "Following the CEO's wallet.",
        "lesson": (
            "Corporate executives (insiders) are legally allowed to buy and sell their own stock, but they MUST report it to the SEC using Form 4 within two days.\n\n"
            "Peter Lynch famously said: 'Insiders might sell their shares for any number of reasons, but they buy them for only one: they think the price will go up.'\n\n"
            "Real-Life Example: If the CEO, CFO, and VP of Sales all suddenly buy $1 Million of their own company's stock on a Tuesday, they probably know something good is coming."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 48,
        "title": "SPACs and IPOs",
        "description": "How companies go public.",
        "lesson": (
            "An IPO (Initial Public Offering) is the traditional, heavily regulated way a private company lists on the stock exchange.\n\n"
            "A SPAC (Special Purpose Acquisition Company) is a 'blank check' shell company that goes public first, and then merges with a private company later as a loophole to bypass IPO regulations.\n\n"
            "Real-Life Example: An IPO is building a new house with full city permits and inspections. A SPAC is buying an empty, already-approved lot and dropping a pre-built house on it overnight."
        ),
        "unlocks": [],
        "xp_reward": 200,
    },
    {
        "id": 49,
        "title": "Trading Psychology: Revenge Trading",
        "description": "The spiral of doom.",
        "lesson": (
            "Revenge Trading happens when you take a painful loss, and instead of walking away, you immediately double your position size on a random trade to 'make it back'.\n\n"
            "This is driven purely by anger and ego, not strategy. It is the fastest way to blow up an entire account.\n\n"
            "Real-Life Example: A poker player loses a big hand. Frustrated, they push all their chips into the middle on the very next hand with terrible cards, hoping to get lucky and 'get even'. They go home broke."
        ),
        "unlocks": [],
        "xp_reward": 250,
    },
    {
        "id": 50,
        "title": "The Master Trader",
        "description": "The final paradigm shift.",
        "lesson": (
            "Amateurs trade to be right; Professionals trade to make money.\n\n"
            "The Master Trader accepts that every trade is just a probability. They don't take losses personally. They execute their system with robotic discipline, manage risk flawlessly, and never let one bad day define their career.\n\n"
            "Real-Life Example: A casino doesn't panic when a tourist wins a jackpot. They know their mathematical edge guarantees they will make millions by the end of the year. Become the casino.\n\n"
            "You have completed the Tradepath curriculum. Welcome to the pros."
        ),
        "unlocks": [],
        "xp_reward": 500,
    },
]


def get_level(level_id: int):
    return next((lvl for lvl in LEVELS if lvl["id"] == level_id), None)
