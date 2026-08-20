"use client";

import { useState } from "react";
import Image from "next/image";

export function ProductGallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const list = images.length > 0 ? images : ["/brand/aflo-logo-original.jpeg"];

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-secondary">
        <Image
          src={list[active]}
          alt={alt}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
      {list.length > 1 && (
        <div className="flex gap-2">
          {list.map((img, idx) => (
            <button
              key={img + idx}
              onClick={() => setActive(idx)}
              className={`relative size-16 overflow-hidden border ${
                active === idx ? "border-accent" : "border-border"
              }`}
            >
              <Image src={img} alt={`${alt} ${idx + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
