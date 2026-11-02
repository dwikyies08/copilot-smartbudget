"use client"

import * as React from "react"
import { Upload, X, ImageIcon, Loader2, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface ProofUploadProps {
  value?: string | null
  onChange: (url: string | null) => void
  disabled?: boolean
  className?: string
  label?: string
}

export function ProofUpload({
  value,
  onChange,
  disabled,
  className,
  label = "Upload Bukti Transfer"
}: ProofUploadProps) {
  const [isUploading, setIsUploading] = React.useState(false)
  const [preview, setPreview] = React.useState<string | null>(value || null)
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 1. Show local preview immediately
    const reader = new FileReader()
    reader.onloadend = () => {
      setPreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    // 2. Simulate Upload (Replace this with real upload logic like Cloudinary/Supabase)
    setIsUploading(true)
    
    // Simulating network delay
    await new Promise((resolve) => setTimeout(resolve, 1500))
    
    // In a real app, you'd upload the file here and get a URL back
    // For now, we'll just use the base64 preview as the "URL"
    const mockUrl = reader.result as string 
    
    onChange(mockUrl)
    setIsUploading(false)
  }

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation()
    setPreview(null)
    onChange(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <div className="flex items-center justify-between">
        <label className="text-sm font-bold uppercase tracking-wider text-muted-foreground/70">
          {label}
        </label>
        {preview && !disabled && (
          <Button 
            type="button" 
            variant="ghost" 
            size="sm" 
            onClick={removeFile}
            className="h-7 text-[10px] font-bold text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <X className="mr-1 h-3 w-3" /> Hapus
          </Button>
        )}
      </div>

      <div 
        onClick={() => !disabled && !isUploading && fileInputRef.current?.click()}
        className={cn(
          "relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500",
          preview 
            ? "border-primary/50 bg-background shadow-inner" 
            : "border-border/40 hover:border-primary/50 hover:bg-primary/[0.02]",
          disabled && "opacity-60 cursor-not-allowed",
          isUploading && "animate-pulse"
        )}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          disabled={disabled || isUploading}
        />

        {preview ? (
          <div className="relative aspect-video w-full sm:aspect-[21/9]">
            <img 
              src={preview} 
              alt="Proof of transfer" 
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="bg-white/20 backdrop-blur-md p-3 rounded-full">
                <Upload className="h-6 w-6 text-white" />
              </div>
            </div>
            
            {isUploading && (
              <div className="absolute inset-0 bg-background/60 backdrop-blur-sm flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-xs font-bold animate-pulse uppercase tracking-widest text-primary">Uploading...</p>
              </div>
            )}
            
            {!isUploading && (
              <div className="absolute bottom-4 right-4 bg-green-500 text-white rounded-full p-1 shadow-lg">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="mb-4 rounded-2xl bg-primary/10 p-4 text-primary transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-primary/5">
              <ImageIcon className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <p className="font-black text-sm uppercase tracking-tight">Klik untuk upload</p>
              <p className="text-[10px] text-muted-foreground uppercase font-medium tracking-widest opacity-60">
                Format: JPG, PNG • Max 2MB
              </p>
            </div>
            
            {isUploading && (
              <div className="absolute inset-0 bg-background/40 backdrop-blur-[2px] flex items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
          </div>
        )}
      </div>
      
      {preview && (
        <p className="text-[10px] text-center text-muted-foreground italic font-medium">
          *Pastikan bukti transfer terlihat jelas dan menampilkan nama Anda/rekening tujuan.
        </p>
      )}
    </div>
  )
}
