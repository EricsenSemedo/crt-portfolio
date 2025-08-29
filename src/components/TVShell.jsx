export default function TVShell({children, className="", brightness=1, intensity=1, frameClassName=""}){
    return (
        <div className={`relative ${className}`}>
            {/* Outer CRT body */}
            <div className={`relative h-full rounded-[18px] shadow-2xl ${frameClassName} bg-zinc-800/90 border border-zinc-900/60 overflow-hidden`}> 
                {/* Painted plastic shell thickness */}
                <div className="p-3 sm:p-4 h-full">
                    <div className="flex items-stretch gap-3 h-full">
                        {/* Screen with bezel */}
                        <div className="relative flex-1 rounded-[14px] bg-zinc-950 border-8 border-zinc-900/80 shadow-[inset_0_0_40px_rgba(0,0,0,0.7)] overflow-hidden">
                            {/* Actual screen content */}
                            <div 
                                className="relative w-full h-full bg-black"
                                style={{ filter: `brightness(${brightness})`}}
                            >
                                {children}
                            </div>

                            {/* Glass curvature highlight */}
                            <div
                                className="pointer-events-none absolute inset-0"
                                style={{
                                    background: "radial-gradient(120% 100% at 50% 50%, rgba(255,255,255,0.18), rgba(0,0,0,0) 60%)",
                                    mixBlendMode: "screen",
                                    opacity: 0.6,
                                }}
                            />

                            {/* Vignette inside screen */}
                            <div
                                className="pointer-events-none absolute inset-0"
                                style={{
                                    background: "radial-gradient(120% 100% at 50% 50%, rgba(255,255,255,0.66), rgba(0,0,0,0.15) 60%, rgba(0,0,0,0.65) 100%)",
                                    mixBlendMode: "overlay",
                                    opacity: .9 * intensity,
                                }}
                            />

                            {/* Scanlines */}
                            <div
                                className="pointer-events-none absolute inset-0"
                                style={{
                                    background: "repeating-linear-gradient(180deg, rgba(255,255,255,0.04) 0px, rgba(255,255,255,0.04) 1px, transparent 2px, transparent 3px)",
                                    opacity: .2 * intensity,
                                }}
                            />

                            {/* Bloom line */}
                            <div className="pointer-events-none absolute inset-x-0 top-12 h-[2px] bg-white/10 blur-[2px]"/>
                        </div>

                        {/* Right-side control panel */}
                        <div className="hidden sm:flex w-24 md:w-28 lg:w-32 shrink-0 relative bg-zinc-900/95 border border-zinc-800 rounded-[12px] shadow-inner flex-col justify-between px-3 py-4">
                            <div className="space-y-3">
                                <div className="h-2 rounded bg-zinc-700/80"/>
                                <div className="h-8 w-8 rounded-full bg-zinc-300/90 border-2 border-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"/>
                                <div className="h-6 w-6 rounded-full bg-zinc-400/90 border-2 border-zinc-600 shadow-[inset_0_2px_4px_rgba(0,0,0,0.4)]"/>
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                                {Array.from({length: 10}).map((_, i) => (
                                    <div key={i} className="h-1.5 bg-zinc-700/80 rounded"/>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}