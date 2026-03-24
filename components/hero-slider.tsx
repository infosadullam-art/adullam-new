"use client"

import { useState, useEffect } from "react"

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "SOLDES ECLAIR!",
      subtitle: "Jusqu'à -70%",
      bg: "from-primary via-orange-500 to-orange-600",
      image: "/shopping-bags-and-gifts.jpg",
    },
    {
      title: "SOLDES",
      subtitle: "Mosseri",
      bg: "from-primary via-red-500 to-red-600",
      image: "/sale-tag.jpg",
    },
    {
      title: "NOUVELLES OFFRES",
      subtitle: "Chaque jour",
      bg: "from-orange-500 via-red-500 to-primary",
      image: "/discount-badge.png",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <section className="relative z-0 pointer-events-auto px-4 py-4">

      <div className="relative overflow-hidden rounded-2xl aspect-[2/1]">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-500 ${currentSlide === index ? "opacity-100" : "opacity-0"}`}
          >
            <div
              className={`bg-gradient-to-r ${slide.bg} h-full p-6 flex items-center justify-between relative overflow-hidden`}
            >
              <div className="relative z-10 flex-1">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">{slide.title}</h2>
                <p className="text-xl md:text-2xl text-white">{slide.subtitle}</p>
              </div>
              <div className="relative z-10">
                <img
                  src={slide.image || "/placeholder.svg"}
                  alt={slide.title}
                  className="w-24 h-24 md:w-32 md:h-32 object-contain"
                />
              </div>
              <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-400 rounded-full blur-3xl opacity-20"></div>
              <div className="absolute left-0 bottom-0 w-24 h-24 bg-orange-300 rounded-full blur-2xl opacity-20"></div>
            </div>
          </div>
        ))}

        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex justify-center gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentSlide ? "bg-white w-6" : "bg-white/50"}`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
