export function DashboardLoader() {
  return (
    <div className="dashboard-loader fixed top-1/2 left-1/2 z-20 flex min-w-[210px] -translate-x-1/2 -translate-y-1/2 items-center gap-2.5 rounded-2xl bg-white/90 px-4 py-3.5 text-[var(--ink)] shadow-[0_18px_50px_rgba(20,65,66,.16)] backdrop-blur-xl dark:bg-[rgba(30,38,51,.94)] dark:shadow-[0_20px_60px_rgba(0,0,0,.46)]" role="status">
      <span className="size-4 rounded-full border-2 border-[rgba(44,122,123,.16)] border-t-[var(--secondary)]" />
      <strong className="text-[9px] tracking-[-.01em]">Loading wallet Analytics</strong>
    </div>
  )
}
