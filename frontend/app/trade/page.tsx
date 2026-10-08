import { Suspense } from "react";
import TradeView from "./TradeView";

export const metadata = { title: "Trade" };

export default function TradePage() {
  return (
    <Suspense fallback={<div className="skeleton h-[480px]" />}>
      <TradeView />
    </Suspense>
  );
}
