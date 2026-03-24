"use client"

import { useState } from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"

const images = [
  "/images/black-wireless-earbuds-main-view.jpg",
  "/images/black-wireless-earbuds-side-view.jpg",
  "/images/black-wireless-earbuds-case-open.jpg",
  "/images/black-wireless-earbuds-charging.jpg",
]

export function ProductGallery() {
  const [selectedImage, setSelectedImage] = useState(0)

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="aspect-square bg-neutral-light rounded-lg overflow-hidden border border-border">
        <Image
          src={images[selectedImage] || "/placeholder.svg?height=600&width=600"}
          alt="Product"
          width={600}
          height={600}
          className="w-full h-full object-contain"
          priority
        />
      </div>

      {/* Thumbnail Images */}
      <div className="grid grid-cols-4 gap-3">
        {images.map((image, index) => (
          <button
            key={index}
            onClick={() => setSelectedImage(index)}
            className={cn(
              "aspect-square bg-neutral-light rounded-lg overflow-hidden border-2 transition-all",
              selectedImage === index ? "border-brand" : "border-border hover:border-gray-300",
            )}
          >
            <Image
              src={image || "/placeholder.svg?height=150&width=150"}
              alt={`Thumbnail ${index + 1}`}
              width={150}
              height={150}
              className="w-full h-full object-contain"
            />
          </button>
        ))}
      </div>
    </div>
  )
}
