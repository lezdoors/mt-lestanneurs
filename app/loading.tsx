// Route-loading state — appears only while a slow navigation resolves
// (Next.js App Router suspense boundary). The Stamp and the Rule, held.
export default function Loading() {
  return (
    <div
      aria-label="Loading"
      className="fixed inset-0 z-[90] flex flex-col items-center justify-center bg-ground"
    >
      <span className="select-none font-wordmark text-4xl font-medium leading-none tracking-[0.06em] text-ink md:text-5xl">
        MT
      </span>
      <span className="mt-6 block h-px w-44 animate-pulse bg-ink/30 md:w-56" />
      <span className="mt-6 font-wordmark text-sm font-normal uppercase leading-none tracking-[0.26em] text-ink md:text-base">
        <span>Maison</span>
        <span aria-hidden className="inline-block w-[1.15ch]" />
        <span>Tanneurs</span>
      </span>
    </div>
  )
}
