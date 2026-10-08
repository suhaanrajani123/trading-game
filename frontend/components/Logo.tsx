/** The Tradepath mark: a stepped path (levels) climbing to a highlighted goal. */
export default function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-[#14213D] dark:fill-[#233357]" />
      <path d="M7 23h5v-5h5v-5h4.5" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="24.5" cy="10" r="3" fill="#F5C437" />
    </svg>
  );
}
