export default function TVShell({children, className="", brightness=1, intensity=1, frameClassName=""}){
    return (
        <div className={`relative ${className}`}>
            {/* Outer CRT body */}
            <div className={`relative h-full rounded-[18px] shadow-2xl ${frameClassName} bg-zinc-800/90 border border-zinc-900/60 overflow-hidden`}> 
                {/* Painted plastic shell thickness */}
                <div className="p-3 sm:p-4 h-full">
                    <div className="flex items-stretch gap-3 h-full">
                        {/* Screen with bezel */}
                        <div className="relative flex-1 rounded-[14px] bg-zinc-950 border-8 border-zinc-900/80 shadow-[inset_0_0_40px_rgba(0,0,0,0.7)] overflow-hidden" data-pan-target>
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

                            {/* Screen center blue debug dot */}
                            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]"/>
                            </div>
                        </div>

                        {/* Integrated bezel controls along screen edges */}
                        <div className="pointer-events-none absolute inset-0">
                            {/* Corner screws */}
                            <div className="absolute top-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-700 ring-1 ring-zinc-600"/>
                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-700 ring-1 ring-zinc-600"/>
                            <div className="absolute bottom-2 left-2 w-1.5 h-1.5 rounded-full bg-zinc-700 ring-1 ring-zinc-600"/>
                            <div className="absolute bottom-2 right-2 w-1.5 h-1.5 rounded-full bg-zinc-700 ring-1 ring-zinc-600"/>

                            {/* Right-edge vents */}
                            <div className="absolute right-1 top-4 bottom-4 flex flex-col justify-between">
                                {Array.from({length: 7}).map((_, i) => (
                                    <div key={i} className="w-[3px] h-3 bg-zinc-700/80 rounded-sm"/>
                                ))}
                            </div>

                            {/* Bottom-edge flush indicators */}
                            <div className="absolute inset-x-6 bottom-1 flex items-center justify-center gap-2">
                                {Array.from({length: 5}).map((_, i) => (
                                    <div key={i} className="w-2 h-2 rounded-full bg-zinc-400/90 ring-1 ring-zinc-600"/>
                                ))}
                            </div>

                            {/* Bezel bevel highlights */}
                            <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-b from-white/10 to-transparent"/>
                            <div className="absolute inset-x-0 bottom-0 h-3 bg-gradient-to-t from-black/40 to-transparent"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}