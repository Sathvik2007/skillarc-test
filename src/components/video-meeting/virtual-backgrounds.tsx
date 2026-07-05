"use client"

import React from "react"
import { EyeOff, AlertCircle } from "lucide-react"

export interface VirtualBg {
  id: string
  name: string
  url?: string
}

interface VirtualBackgroundsProps {
  currentBg: VirtualBg
  onChangeBg: (bg: VirtualBg) => void
  onClose: () => void
}

const BG_OPTIONS: VirtualBg[] = [
  { id: "none", name: "None (Real Video)" },
  { id: "blur", name: "Blur Background" },
  {
    id: "classroom",
    name: "Lecture Hall",
    url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&q=80",
  },
  {
    id: "office",
    name: "Modern Library",
    url: "https://images.unsplash.com/photo-1507842217343-583bb7270b66?w=400&q=80",
  },
  {
    id: "abstract",
    name: "Neon Lights",
    url: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=400&q=80",
  },
]

export default function VirtualBackgrounds({ currentBg, onChangeBg, onClose }: VirtualBackgroundsProps) {
  return (
    <div className="flex flex-col h-full bg-slate-900 border-l border-white/10 text-white font-sans text-left">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between flex-shrink-0">
        <h3 className="text-sm font-bold uppercase tracking-wider">Background Effects</h3>
        <button
          onClick={onClose}
          type="button"
          className="text-xs bg-white/10 hover:bg-white/20 px-2.5 py-1.5 rounded-lg transition-all"
        >
          Close
        </button>
      </div>

      <div className="flex-grow p-5 overflow-y-auto space-y-5">
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-2.5 text-amber-300 text-xs font-semibold leading-normal">
          <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
          <p>
            Virtual backgrounds are processed on your local device browser thread. Background segmentation filters will adjust your video rendering dynamically.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {BG_OPTIONS.map((bg) => {
            const isActive = bg.id === currentBg.id
            return (
              <button
                key={bg.id}
                onClick={() => onChangeBg(bg)}
                className={`flex flex-col border rounded-xl overflow-hidden text-left bg-slate-950/40 hover:bg-slate-950/80 transition-all ${
                  isActive ? "border-blue-500 ring-1 ring-blue-500" : "border-white/10"
                }`}
              >
                {bg.url ? (
                  <div
                    className="h-20 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${bg.url}')` }}
                  />
                ) : (
                  <div className="h-20 w-full bg-slate-900 flex items-center justify-center text-slate-500">
                    <EyeOff size={24} />
                  </div>
                )}
                <div className="p-2.5 text-[11px] font-bold text-slate-200">
                  {bg.name}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
