import { useEffect, useMemo, useRef, useState } from "react";
import {
  AmbientLight,
  Box3,
  Color,
  DirectionalLight,
  GridHelper,
  PerspectiveCamera,
  Scene,
  Vector3,
  WebGLRenderer,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { viewableAssets } from "../three/assets/assetRegistry";

export default function AssetViewer() {
  const [selectedId, setSelectedId] = useState(viewableAssets[0]?.id ?? "");
  const selectedAsset = useMemo(
    () => viewableAssets.find((asset) => asset.id === selectedId) ?? viewableAssets[0],
    [selectedId],
  );
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || !selectedAsset) return;

    const scene = new Scene();
    scene.background = new Color("#050507");

    const camera = new PerspectiveCamera(35, 1, 0.1, 100);
    const renderer = new WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
      preserveDrawingBuffer: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    viewport.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.75;
    controls.minDistance = 2.5;
    controls.maxDistance = 10;

    const ambientLight = new AmbientLight("#cbd5e1", 0.8);
    const keyLight = new DirectionalLight("#fff7ed", 2.2);
    keyLight.position.set(-4, 5, 5);
    keyLight.castShadow = true;
    const rimLight = new DirectionalLight(selectedAsset.accent, 1.1);
    rimLight.position.set(3, 2.5, -3);
    scene.add(ambientLight, keyLight, rimLight);

    const grid = new GridHelper(8, 16, "#155e75", "#1f2937");
    grid.position.y = -1.18;
    scene.add(grid);

    const asset = selectedAsset.create();
    scene.add(asset.group);

    const bounds = new Box3().setFromObject(asset.group);
    const center = bounds.getCenter(new Vector3());
    const size = bounds.getSize(new Vector3());
    const radius = Math.max(size.x, size.y, size.z, 1);
    const distance = radius / Math.sin((camera.fov * Math.PI / 180) / 2) * 0.72;

    controls.target.copy(center);
    camera.position.set(center.x + distance * 0.58, center.y + distance * 0.28, center.z + distance);
    camera.lookAt(center);
    controls.update();

    const resize = () => {
      const { clientWidth, clientHeight } = viewport;
      camera.aspect = clientWidth / Math.max(clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(viewport);
    resize();

    let animationFrame = 0;
    const render = () => {
      controls.update();
      renderer.render(scene, camera);
      animationFrame = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animationFrame);
      resizeObserver.disconnect();
      controls.dispose();
      asset.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [selectedAsset]);

  if (!selectedAsset) {
    return null;
  }

  return (
    <main className="min-h-screen bg-crt-base text-crt-text lg:h-screen lg:overflow-hidden">
      <div className="grid min-h-screen grid-cols-1 lg:h-screen lg:grid-cols-[18rem_1fr]">
        <aside className="max-h-[38vh] overflow-y-auto border-b border-crt-border-subtle bg-crt-surface-primary/80 p-4 lg:max-h-none lg:border-b-0 lg:border-r">
          <div className="mb-5 flex items-center justify-between gap-3">
            <a
              href="/crt-portfolio/"
              className="font-mono text-xs uppercase tracking-[0.22em] text-crt-text-tertiary hover:text-crt-accent-text"
            >
              Portfolio
            </a>
            <span className="h-2 w-2 rounded-full bg-crt-success shadow-[0_0_14px_rgb(var(--crt-accent-success))]" />
          </div>

          <h1 className="mb-5 font-display text-2xl font-bold tracking-wide text-crt-accent-text">
            Asset Bench
          </h1>

          <nav className="grid gap-2">
            {viewableAssets.map((asset) => {
              const isSelected = asset.id === selectedAsset.id;

              return (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setSelectedId(asset.id)}
                  className={
                    "rounded-md border px-3 py-3 text-left transition-colors " +
                    (isSelected
                      ? "border-crt-accent bg-crt-accent-muted/30 text-crt-text"
                      : "border-crt-border-subtle bg-crt-surface-secondary/40 text-crt-text-secondary hover:border-crt-accent/60 hover:text-crt-text")
                  }
                >
                  <span className="block font-display text-sm font-semibold tracking-wide">
                    {asset.label}
                  </span>
                  <span className="mt-1 block font-mono text-xs uppercase tracking-[0.16em] text-crt-text-tertiary">
                    {asset.category}
                  </span>
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="relative h-[62vh] overflow-hidden bg-[#050507] lg:h-screen">
          <div className="pointer-events-none absolute inset-x-0 top-0 z-10 border-b border-cyan-300/15 bg-black/35 px-4 py-3 backdrop-blur-sm">
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-cyan-200">
              {selectedAsset.category} / {selectedAsset.label}
            </div>
          </div>
          <div ref={viewportRef} className="h-full w-full" />
        </section>
      </div>
    </main>
  );
}
