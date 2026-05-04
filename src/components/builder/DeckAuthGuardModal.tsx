import { Link } from "wouter";
import { Save } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeckAuthGuardModal({ open, onOpenChange }: Props) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden border-0 shadow-2xl">
        <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-black p-8 text-center space-y-6 relative">
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
          
          <div className="w-20 h-20 bg-primary/20 backdrop-blur-xl rounded-3xl flex items-center justify-center mx-auto border border-white/20 shadow-2xl animate-pulse">
             <Save className="w-10 h-10 text-primary" />
          </div>

          <div className="space-y-2 relative z-10">
            <h2 className="text-3xl font-serif font-bold text-white tracking-tight">Save Your Inkbound Legacy</h2>
            <p className="text-indigo-200/70 text-sm leading-relaxed max-w-sm mx-auto">
              Sign up for a free account to securely save and manage your decks, track live card values, and export to tournament formats like Pixelborn and Melee.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 relative z-10">
            <Link href="/login?tab=signup">
              <Button className="w-full bg-primary hover:bg-primary/90 text-primary-foreground h-12 text-sm font-bold rounded-xl shadow-xl shadow-primary/20 transition-all hover:scale-[1.02]">
                Become an Illumineer — Sign Up
              </Button>
            </Link>
            <Link href="/login?tab=signin">
              <Button variant="ghost" className="w-full text-white/60 hover:text-white hover:bg-white/5 h-10 text-xs font-bold uppercase tracking-widest">
                Already a member? Log In
              </Button>
            </Link>
          </div>

          <div className="pt-4 flex items-center justify-center gap-6">
            <div className="flex items-center gap-1.5 opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">Deck Persistence</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">Market Tracking</span>
            </div>
            <div className="flex items-center gap-1.5 opacity-40">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">Export Formats</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
