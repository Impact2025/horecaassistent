'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  videoUrl: string | null
  restaurantName: string
  tableNumber: string
  onComplete: (watchedSeconds: number) => void
}

export default function WelkomVideo({ videoUrl, restaurantName, tableNumber, onComplete }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const startTimeRef = useRef<number>(Date.now())
  const [showSkip, setShowSkip] = useState(false)
  const [skipCountdown, setSkipCountdown] = useState(3)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // Probeer met geluid te spelen; val terug op muted als browser het blokkeert
    const video = videoRef.current
    if (video) {
      video.muted = false
      video.play().catch(() => {
        video.muted = true
        setIsMuted(true)
        video.play().catch(() => null)
      })
    }

    const timer = setTimeout(() => setShowSkip(true), 3000)
    const countdown = setInterval(() => {
      setSkipCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdown)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      clearTimeout(timer)
      clearInterval(countdown)
    }
  }, [])

  const handleComplete = () => {
    const watchedSeconds = Math.round((Date.now() - startTimeRef.current) / 1000)
    onComplete(watchedSeconds)
  }

  const handleSkip = () => {
    if (videoRef.current) {
      videoRef.current.pause()
    }
    handleComplete()
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-primary flex items-center justify-center">
      {/* Video background */}
      {videoUrl && (
        <video
          ref={videoRef}
          autoPlay
          muted={isMuted}
          playsInline
          onEnded={handleComplete}
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* Mute toggle */}
      {videoUrl && (
        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-black/40 backdrop-blur flex items-center justify-center"
          aria-label={isMuted ? 'Geluid aanzetten' : 'Geluid uitzetten'}
        >
          <span className="material-symbols-outlined text-white text-xl">
            {isMuted ? 'volume_off' : 'volume_up'}
          </span>
        </button>
      )}

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/40 to-primary/80 pointer-events-none" />

      {/* Center content */}
      <div className="relative z-10 flex flex-col items-center gap-6 px-6 pb-40">
        {/* Avatar placeholder */}
        <div className="w-24 h-24 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center">
          <span className="material-symbols-outlined text-white text-4xl">restaurant</span>
        </div>

        {/* Restaurant name */}
        <h1 className="font-heading text-3xl font-bold text-white text-center leading-tight">
          {restaurantName}
        </h1>
        <p className="font-heading text-white/70 text-base text-center">
          Welkom bij ons restaurant
        </p>
      </div>

      {/* Bottom glass card */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <div className="backdrop-blur-xl bg-white/10 border border-white/10 rounded-xl p-4 flex items-center justify-between">
          {/* Table info */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-xl">table_restaurant</span>
            </div>
            <div>
              <p className="text-white/60 text-xs font-body">Uw tafel</p>
              <p className="text-white font-heading font-bold text-lg">Tafel {tableNumber}</p>
            </div>
          </div>

          {/* Skip button */}
          {showSkip ? (
            <button
              onClick={handleSkip}
              className="bg-tertiary text-white rounded-full px-5 py-2.5 font-body font-semibold text-sm flex items-center gap-2 transition-all active:scale-95"
            >
              Overslaan
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </button>
          ) : (
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <span className="text-white font-heading font-bold text-sm">{skipCountdown}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
