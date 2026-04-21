import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Link } from "wouter";
import { BookOpen } from "lucide-react";
import { SET_ACCENT, SET_BACKGROUNDS, SET_LOGOS } from "@/lib/sets";

interface SetProgressCardProps {
  name: string;
  setId: string; // The numeric ID (e.g. "1")
  setCode: string; // The acronym (e.g. "TFC")
  collected: number;
  total: number;
  releasedAt?: string;
  image?: string; // Fallback representative image
}

export function SetProgressCard({
  name,
  setId,
  setCode,
  collected,
  total,
  releasedAt,
  image
}: SetProgressCardProps) {
  const [bgLoaded, setBgLoaded] = useState(false);
  const [bgError, setBgError] = useState(false);

  const percentage = Math.round((collected / Math.max(total, 1)) * 100);
  const level = Math.floor(percentage / 10);

  const accentColor = SET_ACCENT[setId] || "#6366f1";
  const bgPath = SET_BACKGROUNDS[setId] || image;

  const formattedDate = releasedAt
    ? new Date(releasedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : "Released 2024";

  return (
    <Link href={`/sets/${setId}`}>
      <motion.div
        whileHover={{ y: -5, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="group relative aspect-[5/3.2] rounded-2xl overflow-hidden shadow-xl border border-white/5 bg-slate-950 cursor-pointer"
      >
        {/* Background Image Container */}
        <div className="absolute inset-0 z-0">
          <img
            src={bgPath}
            alt=""
            onLoad={() => setBgLoaded(true)}
            onError={() => setBgError(true)}
            className={cn(
              "w-full h-full object-cover transition-all duration-1000 group-hover:scale-110",
              bgLoaded ? "opacity-70" : "opacity-0",
              bgError && "hidden"
            )}
          />

          {/* Fallback to card art or gradient if primary bg fails */}
          {(bgError || !bgPath) && (
            image ? (
              <img src={image} className="w-full h-full object-cover opacity-30 blur-sm" alt="" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-950 to-slate-900" />
            )
          )}

          {/* Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-transparent transition-colors duration-500" />
        </div>

        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col h-full p-5 justify-between">
          {/* Top Section */}
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-xl font-serif font-black text-white tracking-tight drop-shadow-lg truncate max-w-[200px]">
                {name}
              </h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {formattedDate}
              </p>
            </div>

            {/* Set Logo Badge & Binder Shortcut */}
            <div className="flex items-center gap-2">
              <Link href={`/sets/${setId}?view=binder`}>
                <button
                  className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center shadow-2xl hover:bg-white/15 transition-all group/binder"
                  title="View Binder"
                  onClick={(e) => e.stopPropagation()}
                >
                  <BookOpen className="w-5 h-5 opacity-70 group-hover/binder:opacity-100 transition-opacity" style={{ color: accentColor }} />
                </button>
              </Link>

              <div className="w-10 h-10 rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 p-1.5 flex items-center justify-center shadow-2xl">
                <img
                  src={SET_LOGOS[setId] || `/sets/${setCode}.png`}
                  alt={setCode}
                  className="w-full h-full object-contain opacity-90 group-hover:opacity-100 transition-opacity"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://placehold.co/40x40/black/white?text=${setCode}`;
                  }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-tighter leading-none mb-1">
                  Cards Collected
                </span>
                <span className="text-2xl font-black text-white leading-none">
                  {collected}<span className="text-slate-500 text-sm font-bold ml-1">/{total}</span>
                </span>
              </div>

              <div className="text-right">
                <div className="flex items-center gap-1 justify-end mb-1">
                  <span className="text-[9px] uppercase font-black tracking-widest text-slate-500 leading-none">
                    LEVEL
                  </span>
                  <span className="text-xs font-black px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-white" style={{ color: accentColor }}>
                    {level}
                  </span>
                </div>
                <span className="text-2xl font-black text-white leading-none">
                  {percentage}<span className="text-sm font-bold text-slate-500">%</span>
                </span>
              </div>
            </div>

            {/* Premium Progress Bar (Matches Set Detail Aesthetic) */}
            <div className="relative space-y-2">
              <div className="h-1.5 w-full rounded-full bg-slate-800/50 overflow-hidden border border-white/5">
                {total > 0 ? (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1.2, ease: "circOut" }}
                    className="h-full rounded-full relative shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                    style={{ backgroundColor: accentColor }}
                  >
                    {/* Gloss effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent w-full" />
                  </motion.div>
                ) : (
                  <div className="w-full h-full bg-slate-800/50 flex items-center justify-center">
                    <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                      Announced
                    </span>
                  </div>
                )}
              </div>

              {/* Subtle underglow */}
              {total > 0 && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: `${percentage}%`, opacity: 0.3 }}
                  className="absolute -bottom-1 h-[1px] blur-sm transition-all"
                  style={{ backgroundColor: accentColor }}
                />
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
