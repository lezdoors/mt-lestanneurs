"use client"

import { useState } from "react"

// Hero-first gallery: large frame + thumbnail rail. The Drive-derived
// hero is always images[0] and always opens first.
export function PdpGallery({
  images,
  productName,
}: {
  images: string[]
  productName: string
}) {
  const [index, setIndex] = useState(0)
  const current = images[index] ?? images[0]

  return (
    <div>
      <div className="relative aspect-[4/5] w-full">
        <img
          src={current}
          alt={`${productName} — view ${index + 1}`}
          className="img-float absolute inset-0 h-full w-full object-contain"
        />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`View ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`relative h-20 w-16 shrink-0 transition-opacity ${
                i === index ? "opacity-100 ring-1 ring-ink/40" : "opacity-60 hover:opacity-100"
              }`}
            >
              <img
                src={src}
                alt=""
                loading="lazy"
                className="img-float absolute inset-0 h-full w-full object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
