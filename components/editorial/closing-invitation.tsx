import Link from "next/link"

export function ClosingInvitation() {
  return (
    <section className="bg-ground px-6 pb-32 pt-8 text-center md:pb-48">
      <h2 className="mx-auto max-w-3xl font-display text-4xl font-medium leading-[1.08] tracking-[0.02em] text-ink md:text-6xl">
        Small on purpose.
      </h2>
      <p className="mx-auto mt-10 max-w-md font-serif text-lg leading-relaxed text-ink-soft md:text-xl">
        Few objects, made in small editions. When a piece is right, we make
        it again — never faster.
      </p>
      <Link href="/shop" className="link-caps mt-12 inline-block text-ink">
        View the Collection
      </Link>
    </section>
  )
}
