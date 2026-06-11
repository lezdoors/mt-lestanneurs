// The MT signature — pure typography from the house Bodoni Moda SC.
// The SC font renders lowercase as small caps; tight tracking makes the
// pair read like a blind stamp. Never used as a repeating motif.
export function MtMark({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`select-none font-wordmark font-medium leading-none tracking-[0.06em] ${className}`}
    >
      mt
    </span>
  )
}
