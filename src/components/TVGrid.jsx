import { motion } from "framer-motion";
import TVShell from "./TVShell";

export default function TVGrid({ items = [], selectedId = null, onSelect, getItemRef }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 p-4">
            {items.map((item) => (
                <motion.div
                    key={item.id}
                    ref={getItemRef?.(item.id)}
                    className="cursor-pointer"
                    onClick={() => onSelect?.(item.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <TVShell className="w-full aspect-[4/3]">
                        <div className="h-full flex items-center justify-center">
                            <div className="text-white font-semibold text-center text-sm sm:text-base">
                                {item.title}
                            </div>
                        </div>
                    </TVShell>
                </motion.div>
            ))}
        </div>
    );
}


