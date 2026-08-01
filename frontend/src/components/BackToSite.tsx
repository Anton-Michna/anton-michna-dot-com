export function BackToSite() {
  return (
    <a
      href="/"
      className="fixed top-4 left-4 z-50 flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-lg transition-colors hover:bg-white/20"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        className="h-4 w-4"
      >
        <path d="M19 12H5M12 19l-7-7 7-7" />
      </svg>
      Back to site
    </a>
  );
}
