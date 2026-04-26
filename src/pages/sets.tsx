import { Link } from "wouter";
 import { ArrowRight, Loader2 } from "lucide-react";
 import { useSets } from "@/hooks/useCards";
 import { motion } from "framer-motion";
 
 const SET_COLORS: Record<string, string> = {
   "1": "from-blue-500/20 to-purple-500/20",
   "2": "from-amber-500/20 to-red-500/20",
   "3": "from-emerald-500/20 to-teal-500/20",
   "4": "from-purple-600/20 to-pink-500/20",
   "5": "from-yellow-500/20 to-orange-500/20",
   "6": "from-sky-500/20 to-indigo-500/20",
   "7": "from-rose-500/20 to-orange-400/20",
 };
 
 export default function Sets() {
   const { data: sets = [], isLoading, isError } = useSets();
 
   const mainSets = sets.filter(set => !set.isPromo);
   const promoSets = sets.filter(set => set.isPromo);
 
   return (
     <div className="container mx-auto px-4 md:px-6 py-12">
       <div className="mb-12">
         <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight mb-4">
           Lorcana Collection Tracker
         </h1>
         <p className="text-lg text-muted-foreground max-w-2xl">
           Explore cards by release set and track your collection. Each chapter of Lorcana brings new mechanics, characters, and strategies to the inklands.
         </p>
       </div>
 
       {isLoading && (
         <div className="flex justify-center py-16">
           <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
         </div>
       )}
 
       {isError && (
         <p className="text-destructive text-center py-8">
           Failed to load sets. Please refresh the page.
         </p>
       )}
 
       {!isLoading && !isError && (
         <>
           <div className="mb-10">
             <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">Main Expansions</h2>
             <p className="text-lg text-muted-foreground">
               The core chapters of the Disney Lorcana TCG.
             </p>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-20">
             {mainSets.map((set, i) => (
               <SetCard key={set.id} set={set} i={i} />
             ))}
           </div>
 
           {promoSets.length > 0 && (
             <div className="pt-12 border-t border-border/50">
               <div className="mb-10">
                 <h2 className="font-serif text-3xl font-bold tracking-tight mb-2">Special / Promo Sets</h2>
                 <p className="text-lg text-muted-foreground">
                   Limited edition releases, store championships, and special events.
                 </p>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {promoSets.map((set, i) => (
                   <SetCard key={set.id} set={set} i={i} />
                 ))}
               </div>
             </div>
           )}
         </>
       )}
     </div>
   );
 }
 
 function SetCard({ set, i }: { set: { id: string; name: string; setNum: number; count: number; releasedAt?: string; isPromo?: boolean }, i: number }) {
   const colorClass = SET_COLORS[set.id] ?? "from-slate-500/20 to-gray-500/20";
   return (
     <motion.div
       initial={{ opacity: 0, y: 16 }}
       animate={{ opacity: 1, y: 0 }}
       transition={{ duration: 0.3, delay: i * 0.05 }}
     >
       <Link href={`/sets/${set.id}`}>
         <div className="group h-full p-6 md:p-8 rounded-2xl border bg-card hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden flex flex-col">
           <div
             className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-30 group-hover:opacity-50 transition-opacity`}
           />
 
           <div className="relative z-10 flex flex-col h-full">
             <div className="flex justify-between items-start mb-4">
               <div>
                 <h2 className="text-2xl font-serif font-bold group-hover:text-primary transition-colors">
                   {set.name}
                 </h2>
                 <p className="text-xs font-normal text-muted-foreground uppercase tracking-widest mt-1">
                   {set.releasedAt ? `Release Date: ${new Date(set.releasedAt).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}` : set.id}
                 </p>
               </div>
               <span className="px-3 py-1 rounded-full text-xs font-bold bg-secondary text-secondary-foreground">
                 {set.isPromo ? "Promo Set" : `Set ${set.setNum}`}
               </span>
             </div>
 
             <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/50">
               <span className="text-sm font-medium">{set.count} Cards</span>
               <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1" />
             </div>
           </div>
         </div>
       </Link>
     </motion.div>
   );
 }
