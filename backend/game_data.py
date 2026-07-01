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
            "A stock is a small slice of ownership in a company. When you buy one share "
            "of Apple, you own a tiny fraction of Apple itself — its profits, its assets, "
            "its future. Prices move because buyers and sellers constantly disagree on "
            "what that slice is worth right now.\n\n"
            "Your mission: buy 1 share of any real company using your $100,000 in "
            "practice cash. Watch how its price moves over the next few minutes."
        ),
        "unlocks": ["market_orders"],
        "xp_reward": 50,
    },
    {
        "id": 2,
        "title": "Market vs. Limit Orders",
        "description": "The two basic ways to place a trade.",
        "lesson": (
            "A market order buys or sells immediately at the current price — fast, but "
            "you accept whatever the price is at that instant. A limit order sets the "
            "exact price you're willing to pay or accept, and only executes if the "
            "market reaches it — slower, but you control the price.\n\n"
            "Your mission: place one limit order below the current market price and "
            "watch what happens if the price doesn't reach it."
        ),
        "unlocks": ["limit_orders"],
        "xp_reward": 75,
    },
    {
        "id": 3,
        "title": "Reading a Price Chart",
        "description": "Candlesticks, trends, and what the shape of a chart tells you.",
        "lesson": (
            "Each candlestick shows four numbers for a time period: open, high, low, "
            "close. A green candle closed higher than it opened; red closed lower. "
            "Zoom out and the shape of the candles over time is a trend — the market's "
            "memory made visible.\n\n"
            "Your mission: open the chart for any stock you own and identify one clear "
            "uptrend and one clear downtrend in the last month."
        ),
        "unlocks": ["charting"],
        "xp_reward": 75,
    },
    {
        "id": 4,
        "title": "Diversification",
        "description": "Why 'don't put all your eggs in one basket' is a real strategy.",
        "lesson": (
            "If all your money is in one stock, one bad headline can wipe out a huge "
            "chunk of your portfolio. Spreading money across different companies and "
            "sectors reduces that risk — some will zig while others zag.\n\n"
            "Your mission: hold positions in at least 3 different companies from "
            "different industries at the same time."
        ),
        "unlocks": ["multi_position_view"],
        "xp_reward": 100,
    },
    {
        "id": 5,
        "title": "Risk & Position Sizing",
        "description": "How much of your cash should ever go into one trade?",
        "lesson": (
            "Professional traders often risk only 1-2% of their total account on a "
            "single idea, so one wrong call doesn't end the game. Position sizing is "
            "the discipline of deciding 'how much' before you decide 'what.'\n\n"
            "Your mission: make a trade where the position is less than 10% of your "
            "total account value."
        ),
        "unlocks": ["risk_meter"],
        "xp_reward": 100,
    },
    {
        "id": 6,
        "title": "Short Selling",
        "description": "Profiting when a stock goes down, not up.",
        "lesson": (
            "Short selling means borrowing shares, selling them now, and buying them "
            "back later — hoping the price drops so you can return them cheaper than "
            "you sold them. It's how traders express 'this will go down,' but losses "
            "are theoretically unlimited if the price rises instead, so it's advanced "
            "and risky.\n\n"
            "This mission is a scenario simulation only — no real shorting in v1."
        ),
        "unlocks": ["short_selling_sim"],
        "xp_reward": 125,
    },
]


def get_level(level_id: int):
    return next((lvl for lvl in LEVELS if lvl["id"] == level_id), None)
