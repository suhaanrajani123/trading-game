import { Suspense } from "react";
import ActivityView from "./ActivityView";

export const metadata = { title: "Activity" };

export default function ActivityPage() {
  return (
    <Suspense fallback={<div className="skeleton h-[400px]" />}>
      <ActivityView />
    </Suspense>
  );
}
