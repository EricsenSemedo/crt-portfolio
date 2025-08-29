import { useCallback, useMemo, useState } from "react";
import TVGrid from "./components/TVGrid";
import TVZoomOverlay from "./components/TVZoomOverlay";

export default function App(){
  const [selectedId, setSelectedId] = useState(null);

  const items = useMemo(() => (
    Array.from({ length: 13 }).map((_, i) => ({ id: i + 1, title: `CHANNEL · ${i + 1}` }))
  ), []);

  const selectedItem = useMemo(() => items.find((it) => it.id === selectedId) || null, [items, selectedId]);

  const onClose = useCallback(() => setSelectedId(null),[]);

  return (
    <div className="min-h-screen bg-black">
      <TVGrid items={items} selectedId={selectedId} onSelect={setSelectedId} />

      <TVZoomOverlay selectedItem={selectedItem} onClose={onClose} />
    </div>
  )
}