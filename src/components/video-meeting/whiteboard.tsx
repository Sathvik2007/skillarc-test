"use client"

import React, { useRef, useState, useEffect } from "react"
import { Trash2, Download, Circle, Eraser, Square, Pencil } from "lucide-react"

interface WhiteboardProps {
  onToast: (msg: string, type: "info" | "success" | "warning" | "error") => void
  onClose: () => void
}

export default function Whiteboard({ onToast, onClose }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [color, setColor] = useState("#4f46e5")
  const [lineWidth, setLineWidth] = useState(4)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState<"pencil" | "eraser">("pencil")
  const lastX = useRef(0)
  const lastY = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas sizes based on bounding box
    const resizeCanvas = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      canvas.width = rect?.width || 800
      canvas.height = rect?.height || 500
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.fillStyle = "#ffffff"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    return () => window.removeEventListener("resize", resizeCanvas)
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    const pos = getPos(e)
    lastX.current = pos.x
    lastY.current = pos.y
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const pos = getPos(e)

    ctx.beginPath()
    ctx.moveTo(lastX.current, lastY.current)
    ctx.lineTo(pos.x, pos.y)

    ctx.strokeStyle = tool === "eraser" ? "#ffffff" : color
    ctx.lineWidth = lineWidth
    ctx.stroke()

    lastX.current = pos.x
    lastY.current = pos.y
  }

  const getPos = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return { x: 0, y: 0 }
    const rect = canvas.getBoundingClientRect()
    
    // Check if touch or mouse
    if ("touches" in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 }
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      }
    } else {
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    onToast("Whiteboard cleared", "info")
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (!canvas) return
    const image = canvas.toDataURL("image/png")
    const link = document.createElement("a")
    link.download = `meeting-whiteboard-${Date.now()}.png`
    link.href = image
    link.click()
    onToast("Drawing downloaded successfully", "success")
  }

  return (
    <div className="flex flex-col h-full bg-slate-900 overflow-hidden relative font-sans text-left">
      {/* Board Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 bg-slate-950/90 border-b border-white/10 z-10">
        <div className="flex items-center gap-4">
          <span className="text-white text-xs font-bold uppercase tracking-wider">Lecture Whiteboard</span>
          
          <div className="w-px h-5 bg-white/20" />

          {/* Color pickers */}
          <div className="flex items-center gap-1.5">
            {["#4f46e5", "#0d9488", "#e11d48", "#d97706", "#000000"].map((c) => (
              <button
                key={c}
                onClick={() => {
                  setTool("pencil")
                  setColor(c)
                }}
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  color === c && tool === "pencil" ? "border-white scale-110" : "border-transparent"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>

          <div className="w-px h-5 bg-white/20" />

          {/* Tool pickers */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setTool("pencil")}
              className={`p-1.5 rounded-lg border text-white transition-all ${
                tool === "pencil" ? "bg-indigo-600 border-indigo-500" : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              title="Pen"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setTool("eraser")}
              className={`p-1.5 rounded-lg border text-white transition-all ${
                tool === "eraser" ? "bg-indigo-600 border-indigo-500" : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
              title="Eraser"
            >
              <Eraser size={14} />
            </button>
          </div>

          {/* Brush thickness slider */}
          <div className="flex items-center gap-2 text-white text-xs font-semibold">
            <span>Size:</span>
            <input
              type="range"
              min={2}
              max={24}
              value={lineWidth}
              onChange={(e) => setLineWidth(Number(e.target.value))}
              className="w-20 accent-indigo-500"
            />
            <span className="font-mono">{lineWidth}px</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearCanvas}
            className="p-1.5 bg-white/5 border border-white/10 hover:bg-red-500/20 hover:border-red-500/30 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Trash2 size={13} />
            Clear Board
          </button>
          <button
            onClick={downloadImage}
            className="p-1.5 bg-indigo-600 border border-indigo-500 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-all"
          >
            <Download size={13} />
            Save PNG
          </button>
          <button
            onClick={onClose}
            className="p-1.5 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-lg transition-all"
          >
            Close
          </button>
        </div>
      </div>

      {/* Canvas workspace container */}
      <div className="flex-1 bg-slate-950 relative overflow-hidden flex items-center justify-center p-4">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={() => setIsDrawing(false)}
          onMouseLeave={() => setIsDrawing(false)}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={() => setIsDrawing(false)}
          className="bg-white rounded-2xl cursor-crosshair shadow-2xl transition-all"
        />
      </div>
    </div>
  )
}
