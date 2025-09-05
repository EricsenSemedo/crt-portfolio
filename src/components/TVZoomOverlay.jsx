import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import Navbar from "./Navbar";
import StaticNoise from "./StaticNoise";
import TVShell from "./TVShell";

export default function TVZoomOverlay({ selectedItem, onClose, children}) {
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "Escape") onClose?.();
        }
        if (selectedItem) {
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [selectedItem, onClose]);

    const [showContent, setShowContent] = useState(false);
    const [sweepVisible, setSweepVisible] = useState(false);

    useEffect(() => {
        if (!selectedItem) return;
        setShowContent(false);
        setSweepVisible(false);
        const t1 = setTimeout(() => {
            setShowContent(true);
            setSweepVisible(true);
        }, 180);
        const t2 = setTimeout(() => {
            setSweepVisible(false);
        }, 180 + 700);
        return () => { clearTimeout(t1); clearTimeout(t2); };
    }, [selectedItem]);

    return (
        <AnimatePresence>
            {selectedItem && (
            <motion.div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0 }} exit={{ opacity: 0 }} onClick={onClose}>
                <motion.div className="w-full h-full" onClick={(e) => e.stopPropagation()}>
                <TVShell className="w-full h-full">
                    <motion.div className="relative w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>
                        {!showContent && <StaticNoise intensity={1} />}
                        {showContent && (
                            <div className="absolute inset-0">
                                <Navbar title={selectedItem.title} onClose={onClose} />
                                <div className="absolute inset-0">{children}</div>
                                {sweepVisible && (
                                    <div
                                        className="pointer-events-none absolute -inset-x-0 -top-1/3 h-1/3"
                                        style={{
                                            background: "linear-gradient(to bottom, rgba(255,255,255,0.08), rgba(255,255,255,0))",
                                            mixBlendMode: "screen",
                                            animation: "sweep 0.7s linear forwards",
                                        }}
                                    />
                                )}
                                <style>{`
                                    @keyframes sweep {
                                        0% { transform: translateY(-100%); }
                                        100% { transform: translateY(300%); }
                                    }
                                `}</style>
                            </div>
                        )}
                    </motion.div>
                </TVShell>
                </motion.div>
            </motion.div>
            )}
        </AnimatePresence>
    );
}


