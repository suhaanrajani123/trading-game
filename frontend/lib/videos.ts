/**
 * Curated beginner-to-intermediate stock market videos. All IDs verified
 * against real, currently-live YouTube uploads at the time of writing.
 * If YouTube ever pulls one down, the thumbnail/embed will simply 404 —
 * worth spot-checking this list occasionally.
 */
export interface CuratedVideo {
  id: string; // YouTube video ID
  title: string;
  channel: string;
  description: string;
  category: "Absolute Basics" | "Full Courses" | "Trusted Educators" | "Real Investor Talk";
}

export const CURATED_VIDEOS: CuratedVideo[] = [
  {
    id: "98qfFzqDKR8",
    title: "What It Means to Buy a Company's Stock",
    channel: "Khan Academy",
    description: "The clearest starting point available: what you actually own when you buy one share, in plain language, free.",
    category: "Absolute Basics",
  },
  {
    id: "Qh-M3_L4xYk",
    title: "Introduction to Bonds",
    channel: "Khan Academy",
    description: "Stocks aren't the only asset out there — this explains bonds, the other half of most portfolios, from scratch.",
    category: "Absolute Basics",
  },
  {
    id: "whodwBKZS7o",
    title: "Stock Market Simulation, Explained",
    channel: "Khan Academy",
    description: "A short explainer on how classroom market simulations (like this app) work and what they're meant to teach.",
    category: "Absolute Basics",
  },
  {
    id: "bb6_M_srMBk",
    title: "Stock Market for Beginners — The Ultimate Investing Guide",
    channel: "Independent Educator",
    description: "A 50+ minute, start-to-finish walkthrough of actually buying and selling stocks as a first-timer.",
    category: "Full Courses",
  },
  {
    id: "wIgU24a4WzM",
    title: "Ultimate Stock Trading Beginners Guide (Free Full Course)",
    channel: "Trading Educator",
    description: "A longer-form course covering market mechanics in more depth than a typical single video can.",
    category: "Full Courses",
  },
  {
    id: "ShAjJ2MYp9c",
    title: "This Is How You Build Wealth",
    channel: "The Plain Bagel",
    description: "Hosted by a CFA charterholder — a grounded, no-hype look at what actually builds long-term wealth.",
    category: "Trusted Educators",
  },
  {
    id: "wFlBrYa4nrw",
    title: "Intro to Investing — University Guest Lecture",
    channel: "The Plain Bagel",
    description: "A real university finance lecture from the same CFA-credentialed educator — more formal, still accessible.",
    category: "Trusted Educators",
  },
  {
    id: "lNdOtlpmH5U",
    title: "How to Invest for Beginners",
    channel: "Ali Abdaal",
    description: "One of the most-watched beginner investing guides on YouTube — polished, calm, and genuinely first-timer-friendly.",
    category: "Trusted Educators",
  },
  {
    id: "0qrzbh7UIho",
    title: "A Conversation on What Moves the Market",
    channel: "Andrei Jikh, Graham Stephan & Financial Education",
    description: "Less a lesson, more a listen-in — three well-known finance creators reacting to real market conditions.",
    category: "Real Investor Talk",
  },
  {
    id: "bu8gJha3HMY",
    title: "Stock Portfolio Showdown",
    channel: "Andrei Jikh vs. Graham Stephan",
    description: "Two creators compare their real personal stock portfolios — useful for seeing how different real people invest.",
    category: "Real Investor Talk",
  },
];
