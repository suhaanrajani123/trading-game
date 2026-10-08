import { Suspense } from "react";
import LearnView from "./LearnView";

export const metadata = { title: "Lessons" };

export default function LearnPage() {
  return (
    <Suspense fallback={<div className="skeleton h-[480px]" />}>
      <LearnView />
    </Suspense>
  );
}
