import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import StaticNoise from "./StaticNoise";
import TVShell from "./TVShell";

export default function TVZoomOverlay({ selectedItem, onClose }) {
    useEffect(() => {
        function handleKeyDown(e) {
            if (e.key === "Escape") onClose?.();
        }
        if (selectedItem) {
            window.addEventListener("keydown", handleKeyDown);
            return () => window.removeEventListener("keydown", handleKeyDown);
        }
    }, [selectedItem, onClose]);

    return (
        <AnimatePresence>
            {selectedItem && (
                <motion.div
                    key={selectedItem.id}
                    className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        layoutId={`tv-${selectedItem.id}`}
                        className="w-[96vw] sm:w-[80vw] md:w-[72vw] max-w-6xl aspect-[4/3]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <TVShell className="w-full h-full">
                            <motion.div
                                className="relative w-full h-full"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <StaticNoise intensity={1} />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-white font-semibold text-center">
                                        {selectedItem.title}
                                    </div>
                                </div>
                            </motion.div>
                        </TVShell>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}


