import {
  ACESFilmicToneMapping,
  AmbientLight,
  Box3,
  CanvasTexture,
  Color,
  DirectionalLight,
  Fog,
  Group,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  PerspectiveCamera,
  PMREMGenerator,
  PointLight,
  Quaternion,
  Raycaster,
  Scene,
  Sprite,
  SpriteMaterial,
  SRGBColorSpace,
  Vector2,
  Vector3,
  WebGLRenderer,
  type Material,
  type Texture,
} from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { HDRLoader } from "three/examples/jsm/loaders/HDRLoader.js";
import { PORTFOLIO_CHANNELS, type PortfolioChannelId } from "../data/channels";
import { createBasementRoom } from "./assets/createBasementRoom";
import { createDiscTV } from "./assets/createDiscTV";
import { createGameTV } from "./assets/createGameTV";
import { createTable } from "./assets/createTable";
import { createVhsTV } from "./assets/createVhsTV";
import {
  getScreenTransitionDuration,
  getRandomScreenTransitionKind,
  type ScreenTransitionKind,
} from "./screenTransition";
import { getResponsiveScreenFits } from "./screenFitProfiles";
import {
  getBasketballHorizontalBounds,
  getCameraCoverDistance,
  getSceneLayout,
  scaleCoordinateAroundPivot,
  type HorizontalBounds,
  type SceneLayout,
} from "./responsiveScene";

export type ScreenTransitionResult = "completed" | "cancelled";
export interface ScreenFit {
  scale: [number, number];
  offset: [number, number];
}

interface SceneAsset {
  group: Group;
  dispose: () => void;
}

interface TvAsset extends SceneAsset {
  screenAnchor: Object3D;
  screenPlane: Mesh;
  hoverLight: PointLight;
}

interface ChannelConfig {
  id: PortfolioChannelId;
  label: string;
  subtitle: string;
  asset: TvAsset;
  position: [number, number, number];
  rotationY: number;
  scale: number;
  screenFit: ScreenFit;
}

interface ScreenDisplay {
  canvas: HTMLCanvasElement;
  texture: CanvasTexture;
  material: MeshBasicMaterial;
  lastFrame: number;
  hoverStartedAt: number;
}

interface BasketballBody {
  group: Group;
  velocity: Vector3;
  radius: number;
  floorY: number;
  active: boolean;
  horizontalBounds: HorizontalBounds;
}

interface ActiveScreenTransition {
  display: ScreenDisplay;
  source: HTMLCanvasElement;
  kind: ScreenTransitionKind;
  startedAt: number;
  duration: number;
  reverse: boolean;
  resolve: (result: ScreenTransitionResult) => void;
}

interface HeldScreenEffect {
  display: ScreenDisplay;
  source: HTMLCanvasElement;
  kind: ScreenTransitionKind;
  startedAt: number;
  active: boolean;
}

export interface PortfolioSceneController {
  canvas: HTMLCanvasElement;
  resize: (width: number, height: number) => void;
  render: (time: number) => void;
  pick: (clientX: number, clientY: number) => PortfolioChannelId | null;
  activateAt: (clientX: number, clientY: number) => PortfolioChannelId | "basketball" | null;
  setParallax: (x: number, y: number) => void;
  setHovered: (id: PortfolioChannelId | null) => void;
  focus: (id: PortfolioChannelId, reducedMotion?: boolean, quick?: boolean) => Promise<void>;
  transitionScreen: (id: PortfolioChannelId, reducedMotion?: boolean) => Promise<ScreenTransitionResult>;
  setScreenEffectActive: (active: boolean) => void;
  reset: (reducedMotion?: boolean, quick?: boolean) => Promise<void>;
  dispose: () => void;
}

const OVERVIEW_POSITION = new Vector3(0, 1.82, 7.55);
const OVERVIEW_TARGET = new Vector3(0, 0.05, -0.4);
const TABLE_COLLIDER = { centerZ: -0.65, halfWidth: 2.95, halfDepth: 0.925, topY: 0.11 };

export function createPortfolioScene(): PortfolioSceneController {
  const scene = new Scene();
  scene.background = new Color("#111111");
  scene.fog = new Fog("#111111", 8, 17);

  const camera = new PerspectiveCamera(38, 1, 0.1, 40);
  camera.position.copy(OVERVIEW_POSITION);
  camera.lookAt(OVERVIEW_TARGET);
  const overviewPosition = OVERVIEW_POSITION.clone();
  let sceneLayout = getSceneLayout(1280, 800);

  const renderer = new WebGLRenderer({
    antialias: true,
    alpha: false,
    powerPreference: "high-performance",
  });
  renderer.outputColorSpace = SRGBColorSpace;
  renderer.toneMapping = ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.shadowMap.enabled = true;

  const ambient = new AmbientLight("#d3dcdf", 0.42);
  const ceiling = new PointLight("#f8fafa", 20, 12, 1.8);
  ceiling.position.set(-1.2, 4.2, 2.2);
  ceiling.castShadow = true;
  ceiling.shadow.mapSize.set(1024, 1024);
  const fill = new DirectionalLight("#2457ff", 0.28);
  fill.position.set(4, 2.4, 5);
  scene.add(ambient, ceiling, fill);

  const room = createBasementRoom();
  room.group.position.set(0, 0, -0.4);
  const table = createTable();
  table.group.position.set(0, -0.06, -0.65);
  scene.add(room.group, table.group);

  const channels: ChannelConfig[] = [
    {
      id: "home",
      label: PORTFOLIO_CHANNELS.home.title.toUpperCase(),
      subtitle: `CH ${PORTFOLIO_CHANNELS.home.number}`,
      asset: createVhsTV(),
      position: [-1.82, 1.08, -0.48],
      rotationY: 0.11,
      scale: 0.72,
      screenFit: { scale: [1.19, 1.58], offset: [0.12, -0.1] },
    },
    {
      id: "portfolio",
      label: PORTFOLIO_CHANNELS.portfolio.title.toUpperCase(),
      subtitle: `CH ${PORTFOLIO_CHANNELS.portfolio.number}`,
      asset: createDiscTV(),
      position: [0, 1.04, -0.76],
      rotationY: 0,
      scale: 0.78,
      screenFit: { scale: [1.25, 1.83], offset: [0.08, -0.16] },
    },
    {
      id: "contact",
      label: PORTFOLIO_CHANNELS.contact.title.toUpperCase(),
      subtitle: `CH ${PORTFOLIO_CHANNELS.contact.number}`,
      asset: createGameTV(),
      position: [1.84, 1.02, -0.5],
      rotationY: -0.11,
      scale: 0.67,
      screenFit: { scale: [1.44, 2.11], offset: [-0.12, 0.05] },
    },
  ];

  const displays = new Map<PortfolioChannelId, ScreenDisplay>();
  const hitTargets: Mesh[] = [];

  channels.forEach((channel) => {
    const { group, screenPlane, hoverLight } = channel.asset;
    group.position.set(...channel.position);
    group.rotation.y = channel.rotationY;
    group.scale.setScalar(channel.scale);
    screenPlane.userData.channelId = channel.id;
    hitTargets.push(screenPlane);
    hoverLight.intensity = 0.08;
    scene.add(group);

    const display = createScreenDisplay(channel.label, channel.subtitle);
    const originalMaterial = screenPlane.material;
    if (Array.isArray(originalMaterial)) originalMaterial.forEach((material) => material.dispose());
    else originalMaterial.dispose();
    screenPlane.material = display.material;
    displays.set(channel.id, display);
  });

  const interactionPrompt = createInteractionPrompt();
  scene.add(interactionPrompt.sprite);

  const importedResources: Array<{ dispose: () => void }> = [];
  const roomColliders = createBasketballColliders();
  const basketballColliders = [...roomColliders];
  const basketballHitTargets: Object3D[] = [];
  let basketballBody: BasketballBody | null = null;
  let realisticTelevisions: Group | null = null;
  let isDisposed = false;
  void loadGarageEnvironment(renderer, scene).then((environment) => {
    if (!environment) return;
    if (isDisposed) environment.dispose();
    else importedResources.push(environment);
  });
  void loadIndustrialTable().then((importedTable) => {
    if (!importedTable) return;
    if (isDisposed) importedTable.dispose();
    else {
      table.group.visible = false;
      scene.add(importedTable.group);
      importedResources.push(importedTable);
    }
  });
  void loadPlayStation2Model().then((playStation) => {
    if (!playStation) return;
    if (isDisposed) playStation.dispose();
    else {
      scene.add(playStation.group);
      importedResources.push(playStation);
    }
  });
  void loadRealisticTelevisions(channels, () => isDisposed).then((televisions) => {
    if (!televisions) return;
    if (isDisposed) televisions.dispose();
    else {
      realisticTelevisions = televisions.group;
      scene.add(televisions.group);
      applyResponsiveLayout(sceneLayout);
      importedResources.push(televisions);
    }
  });

  void loadBasketballModel().then((basketball) => {
    if (!basketball) return;
    if (isDisposed) basketball.dispose();
    else {
      scene.add(basketball.group);
      importedResources.push(basketball);
      basketball.group.traverse((object) => {
        if (object instanceof Mesh) basketballHitTargets.push(object);
      });
      basketballBody = {
        group: basketball.group,
        velocity: new Vector3(),
        radius: 0.41,
        floorY: -0.68,
        active: false,
        horizontalBounds: getBasketballHorizontalBounds(sceneLayout, camera.aspect, 0.42, 0.41),
      };
      basketball.group.position.x = sceneLayout.ballStartX;
    }
  });

  const allAssets: SceneAsset[] = [
    room,
    table,
    ...channels.map((channel) => channel.asset),
  ];
  const raycaster = new Raycaster();
  const pointer = new Vector2();
  const parallaxTarget = new Vector2();
  const parallaxCurrent = new Vector2();
  const lookTarget = OVERVIEW_TARGET.clone();
  let lastFrameTime = performance.now();
  let hovered: PortfolioChannelId | null = null;
  let isOverview = true;
  let animation: {
    startedAt: number;
    duration: number;
    fromPosition: Vector3;
    toPosition: Vector3;
    fromTarget: Vector3;
    toTarget: Vector3;
    arcStrength: number;
    resolve: () => void;
  } | null = null;
  let screenTransition: ActiveScreenTransition | null = null;
  let heldScreenEffect: HeldScreenEffect | null = null;

  function resize(width: number, height: number) {
    if (isDisposed) return;
    const responsiveScreenFits = getResponsiveScreenFits(width, height);
    channels.forEach((channel) => applyScreenFit(channel.id, responsiveScreenFits[channel.id]));
    sceneLayout = getSceneLayout(width, height);
    camera.aspect = width / Math.max(height, 1);
    camera.fov = sceneLayout.fov;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, sceneLayout.pixelRatioCap));
    renderer.setSize(width, height, false);
    overviewPosition.set(...sceneLayout.camera);
    interactionPrompt.baseY = sceneLayout.promptY;
    interactionPrompt.sprite.position.x = 0;
    interactionPrompt.setLabel(
      window.matchMedia("(hover: none), (pointer: coarse)").matches
        ? "TAP A TV TO VIEW"
        : "CLICK A TV TO VIEW",
    );
    applyResponsiveLayout(sceneLayout);
    if (basketballBody) {
      basketballBody.horizontalBounds = getBasketballHorizontalBounds(
        sceneLayout,
        camera.aspect,
        basketballBody.group.position.z,
        basketballBody.radius,
      );
      basketballBody.group.position.x = MathUtils.clamp(
        basketballBody.group.position.x,
        basketballBody.horizontalBounds.min,
        basketballBody.horizontalBounds.max,
      );
    }
    if (!animation && isOverview) {
      camera.position.copy(overviewPosition);
      lookTarget.set(...sceneLayout.target);
      camera.lookAt(lookTarget);
    }
  }

  function render(time: number) {
    if (isDisposed) return;
    const delta = Math.min(Math.max((time - lastFrameTime) / 1000, 0), 0.033);
    lastFrameTime = time;
    if (basketballBody?.active) updateBasketballPhysics(basketballBody, basketballColliders, delta);
    if (interactionPrompt.sprite.visible) {
      interactionPrompt.sprite.position.y = interactionPrompt.baseY + Math.sin(time * 0.0032) * 0.07;
      interactionPrompt.material.opacity = 0.88 + Math.sin(time * 0.0024) * 0.08;
    }
    if (animation) {
      const progress = Math.min((time - animation.startedAt) / animation.duration, 1);
      const eased = easeInOutCubic(progress);
      camera.position.lerpVectors(animation.fromPosition, animation.toPosition, eased);
      camera.position.y += Math.sin(progress * Math.PI) * animation.arcStrength;
      lookTarget.lerpVectors(animation.fromTarget, animation.toTarget, eased);
      camera.lookAt(lookTarget);
      if (progress >= 1) {
        const resolve = animation.resolve;
        animation = null;
        resolve();
      }
    } else if (isOverview) {
      parallaxCurrent.lerp(parallaxTarget, 0.065);
      camera.position.copy(overviewPosition);
      camera.position.x += parallaxCurrent.x * 0.2;
      camera.position.y += parallaxCurrent.y * 0.12;
      lookTarget.set(...sceneLayout.target);
      lookTarget.x += parallaxCurrent.x * 0.28;
      lookTarget.y += parallaxCurrent.y * 0.18;
      camera.lookAt(lookTarget);
    }

    if (screenTransition) {
      const progress = Math.min((time - screenTransition.startedAt) / screenTransition.duration, 1);
      drawScreenTransition(
        screenTransition.display.canvas,
        screenTransition.source,
        screenTransition.kind,
        progress,
        screenTransition.reverse,
      );
      screenTransition.display.texture.needsUpdate = true;
      if (progress >= 1) {
        const completed = screenTransition;
        const resolve = completed.resolve;
        screenTransition = null;
        if (!completed.reverse) {
          heldScreenEffect = {
            display: completed.display,
            source: completed.source,
            kind: completed.kind,
            startedAt: time,
            active: completed.kind === "signal-acquisition",
          };
        }
        resolve("completed");
      }
    } else if (
      heldScreenEffect?.kind === "signal-acquisition"
      && heldScreenEffect.active
      && time - heldScreenEffect.display.lastFrame > 70
    ) {
      const progress = ((time - heldScreenEffect.startedAt) % 240) / 240;
      drawScreenTransition(
        heldScreenEffect.display.canvas,
        heldScreenEffect.source,
        heldScreenEffect.kind,
        progress,
        false,
        true,
      );
      heldScreenEffect.display.texture.needsUpdate = true;
      heldScreenEffect.display.lastFrame = time;
    } else if (hovered) {
      const display = displays.get(hovered);
      const channel = channels.find((item) => item.id === hovered);
      if (display && channel && time - display.lastFrame > 70) {
        drawScreen(display.canvas, channel.label, channel.subtitle, time - display.hoverStartedAt);
        display.texture.needsUpdate = true;
        display.lastFrame = time;
      }
    }
    renderer.render(scene, camera);
  }

  function pick(clientX: number, clientY: number) {
    setRaycasterFromClient(clientX, clientY);
    const hit = raycaster.intersectObjects(hitTargets, false)[0];
    return (hit?.object.userData.channelId as PortfolioChannelId | undefined) ?? null;
  }

  function activateAt(clientX: number, clientY: number) {
    setRaycasterFromClient(clientX, clientY);
    const televisionHit = raycaster.intersectObjects(hitTargets, false)[0];
    const basketballHit = raycaster.intersectObjects(basketballHitTargets, true)[0];
    if (basketballBody && basketballHit && (!televisionHit || basketballHit.distance < televisionHit.distance)) {
      const ballCenter = basketballBody.group.getWorldPosition(new Vector3());
      const horizontalTap = MathUtils.clamp(
        (basketballHit.point.x - ballCenter.x) / basketballBody.radius,
        -1,
        1,
      );
      basketballBody.velocity.set(-horizontalTap * 3.1, 5.2, -0.38);
      basketballBody.active = true;
      return "basketball";
    }
    return (televisionHit?.object.userData.channelId as PortfolioChannelId | undefined) ?? null;
  }

  function setRaycasterFromClient(clientX: number, clientY: number) {
    const bounds = renderer.domElement.getBoundingClientRect();
    pointer.x = ((clientX - bounds.left) / bounds.width) * 2 - 1;
    pointer.y = -((clientY - bounds.top) / bounds.height) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);
  }

  function setParallax(x: number, y: number) {
    parallaxTarget.set(MathUtils.clamp(x, -1, 1), MathUtils.clamp(y, -1, 1));
  }

  function applyScreenFit(id: PortfolioChannelId, fit: ScreenFit) {
    const channel = channels.find((item) => item.id === id);
    if (!channel) return;
    channel.screenFit = fit;
    channel.asset.screenPlane.scale.set(fit.scale[0], fit.scale[1], 1);
    channel.asset.screenPlane.position.x = fit.offset[0];
    channel.asset.screenPlane.position.y = fit.offset[1];
  }

  function setHovered(next: PortfolioChannelId | null) {
    if (hovered === next) return;
    channels.forEach((channel) => {
      channel.asset.hoverLight.intensity = channel.id === next ? 1.2 : 0.08;
      const display = displays.get(channel.id);
      if (display && channel.id !== next) {
        drawScreen(display.canvas, channel.label, channel.subtitle, 0);
        display.texture.needsUpdate = true;
      }
    });
    if (next) {
      const display = displays.get(next);
      if (display) display.hoverStartedAt = performance.now();
    }
    hovered = next;
  }

  function focus(id: PortfolioChannelId, reducedMotion = false, quick = false) {
    const channel = channels.find((item) => item.id === id);
    if (!channel) return Promise.resolve();
    interactionPrompt.sprite.visible = false;
    isOverview = false;
    const screenPosition = channel.asset.screenPlane.getWorldPosition(new Vector3());
    const screenDirection = new Vector3(0, 0, 1).applyQuaternion(
      channel.asset.screenPlane.getWorldQuaternion(new Quaternion()),
    );
    channel.asset.screenPlane.geometry.computeBoundingBox();
    const localSize = channel.asset.screenPlane.geometry.boundingBox?.getSize(new Vector3()) ?? new Vector3(1, 1, 0);
    const worldScale = channel.asset.screenPlane.getWorldScale(new Vector3());
    const coverDistance = getCameraCoverDistance(
      localSize.x * Math.abs(worldScale.x),
      localSize.y * Math.abs(worldScale.y),
      camera.aspect,
      camera.fov,
    );
    const destination = screenPosition.clone().add(
      screenDirection.multiplyScalar(coverDistance),
    );
    return animateTo(destination, screenPosition, reducedMotion ? 1 : quick ? 380 : 760, 0.18);
  }

  function transitionScreen(id: PortfolioChannelId, reducedMotion = false) {
    if (isDisposed) return Promise.resolve("cancelled" as const);
    const channel = channels.find((item) => item.id === id);
    const display = displays.get(id);
    if (!channel || !display || reducedMotion) return Promise.resolve("completed" as const);
    if (screenTransition) screenTransition.resolve("cancelled");
    const source = document.createElement("canvas");
    source.width = display.canvas.width;
    source.height = display.canvas.height;
    drawScreen(source, channel.label, channel.subtitle, 0);
    const kind = getRandomScreenTransitionKind();
    return new Promise<ScreenTransitionResult>((resolve) => {
      screenTransition = {
        display,
        source,
        kind,
        startedAt: performance.now(),
        duration: getScreenTransitionDuration(kind),
        reverse: false,
        resolve,
      };
    });
  }

  function setScreenEffectActive(active: boolean) {
    if (!heldScreenEffect || heldScreenEffect.kind !== "signal-acquisition") return;
    heldScreenEffect.active = active;
    heldScreenEffect.startedAt = performance.now();
  }

  async function reset(reducedMotion = false, quick = false) {
    if (isDisposed) return;
    if (screenTransition) {
      const resolve = screenTransition.resolve;
      screenTransition = null;
      resolve("cancelled");
    }
    if (heldScreenEffect && !reducedMotion) {
      const effect = heldScreenEffect;
      heldScreenEffect = null;
      await new Promise<ScreenTransitionResult>((resolve) => {
        screenTransition = {
          display: effect.display,
          source: effect.source,
          kind: effect.kind,
          startedAt: performance.now(),
          duration: getScreenTransitionDuration(effect.kind),
          reverse: true,
          resolve,
        };
      });
    } else {
      heldScreenEffect = null;
    }
    if (isDisposed) return;
    channels.forEach((channel) => {
      const display = displays.get(channel.id);
      if (!display) return;
      drawScreen(display.canvas, channel.label, channel.subtitle, 0);
      display.texture.needsUpdate = true;
    });
    isOverview = true;
    interactionPrompt.sprite.visible = true;
    return animateTo(
      overviewPosition,
      new Vector3(...sceneLayout.target),
      reducedMotion ? 1 : quick ? 280 : 620,
      0.1,
    );
  }

  function applyResponsiveLayout(layout: SceneLayout) {
    channels.forEach((channel, index) => {
      channel.position[0] = layout.channelX[index];
      channel.asset.group.position.x = layout.channelX[index];
      channel.asset.group.position.y = scaleCoordinateAroundPivot(
        channel.position[1],
        TABLE_COLLIDER.topY,
        layout.tvScale,
      );
      channel.asset.group.position.z = scaleCoordinateAroundPivot(
        channel.position[2],
        TABLE_COLLIDER.centerZ,
        layout.tvScale,
      );
      channel.asset.group.scale.setScalar(channel.scale * layout.tvScale);
    });
    realisticTelevisions?.children.forEach((television, index) => {
      television.position.x = layout.channelX[index];
      const desktopScale = television.userData.desktopScale as number | undefined ?? television.scale.x;
      const desktopY = television.userData.desktopY as number | undefined ?? television.position.y;
      const desktopZ = television.userData.desktopZ as number | undefined ?? television.position.z;
      television.userData.desktopScale = desktopScale;
      television.userData.desktopY = desktopY;
      television.userData.desktopZ = desktopZ;
      television.position.y = scaleCoordinateAroundPivot(desktopY, TABLE_COLLIDER.topY, layout.tvScale);
      television.position.z = scaleCoordinateAroundPivot(desktopZ, TABLE_COLLIDER.centerZ, layout.tvScale);
      television.scale.setScalar(desktopScale * layout.tvScale);
    });
    if (realisticTelevisions) {
      realisticTelevisions.updateWorldMatrix(true, true);
      basketballColliders.splice(roomColliders.length);
      realisticTelevisions.children.forEach((television) => {
        basketballColliders.push(new Box3().setFromObject(television));
      });
    }
  }

  function animateTo(position: Vector3, target: Vector3, duration: number, arcStrength: number) {
    if (isDisposed) return Promise.resolve();
    if (animation) animation.resolve();
    return new Promise<void>((resolve) => {
      animation = {
        startedAt: performance.now(),
        duration,
        fromPosition: camera.position.clone(),
        toPosition: position.clone(),
        fromTarget: lookTarget.clone(),
        toTarget: target.clone(),
        arcStrength,
        resolve,
      };
    });
  }

  function dispose() {
    if (isDisposed) return;
    isDisposed = true;
    if (animation) animation.resolve();
    if (screenTransition) screenTransition.resolve("cancelled");
    displays.forEach((display) => {
      display.texture.dispose();
      display.material.dispose();
    });
    allAssets.forEach((asset) => asset.dispose());
    importedResources.forEach((resource) => resource.dispose());
    interactionPrompt.dispose();
    ceiling.shadow.dispose();
    renderer.dispose();
    renderer.domElement.remove();
  }

  return {
    canvas: renderer.domElement,
    resize,
    render,
    pick,
    activateAt,
    setParallax,
    setHovered,
    focus,
    transitionScreen,
    setScreenEffectActive,
    reset,
    dispose,
  };
}

function updateBasketballPhysics(body: BasketballBody, colliders: Box3[], delta: number) {
  body.velocity.y -= 8.8 * delta;
  body.group.position.addScaledVector(body.velocity, delta);
  body.group.rotation.x += (body.velocity.z * delta) / body.radius;
  body.group.rotation.z -= (body.velocity.x * delta) / body.radius;

  colliders.forEach((collider) => resolveSphereBoxCollision(body, collider));

  if (body.group.position.y <= body.floorY) {
    body.group.position.y = body.floorY;
    if (Math.abs(body.velocity.y) > 0.42) body.velocity.y *= -0.54;
    else body.velocity.y = 0;
    const friction = Math.exp(-1.75 * delta);
    body.velocity.x *= friction;
    body.velocity.z *= friction;
  }

  const { min: xMin, max: xMax } = body.horizontalBounds;
  if (body.group.position.x < xMin || body.group.position.x > xMax) {
    body.group.position.x = MathUtils.clamp(body.group.position.x, xMin, xMax);
    body.velocity.x *= -0.66;
  }
  const zMin = -3.6 + body.radius;
  const zMax = 3.2 - body.radius;
  if (body.group.position.z < zMin || body.group.position.z > zMax) {
    body.group.position.z = MathUtils.clamp(body.group.position.z, zMin, zMax);
    body.velocity.z *= -0.66;
  }

  if (body.velocity.lengthSq() < 0.0025 && body.group.position.y === body.floorY) {
    body.velocity.set(0, 0, 0);
    body.active = false;
  }
}

function createBasketballColliders() {
  const tableMinZ = TABLE_COLLIDER.centerZ - TABLE_COLLIDER.halfDepth;
  const tableMaxZ = TABLE_COLLIDER.centerZ + TABLE_COLLIDER.halfDepth;
  return [
    new Box3(
      new Vector3(-TABLE_COLLIDER.halfWidth, -0.05, tableMinZ),
      new Vector3(TABLE_COLLIDER.halfWidth, TABLE_COLLIDER.topY, tableMaxZ),
    ),
    ...[-2.55, 2.55].flatMap((x) => [-1.25, -0.05].map((z) => new Box3(
      new Vector3(x - 0.12, -1.14, z - 0.12),
      new Vector3(x + 0.12, -0.05, z + 0.12),
    ))),
  ];
}

function resolveSphereBoxCollision(body: BasketballBody, collider: Box3) {
  const closest = collider.clampPoint(body.group.position, new Vector3());
  const normal = body.group.position.clone().sub(closest);
  const distanceSquared = normal.lengthSq();
  if (distanceSquared >= body.radius * body.radius) return;

  const distance = Math.sqrt(distanceSquared);
  if (distance > 0.0001) normal.multiplyScalar(1 / distance);
  else {
    const distances = [
      { distance: body.group.position.x - collider.min.x, normal: new Vector3(-1, 0, 0) },
      { distance: collider.max.x - body.group.position.x, normal: new Vector3(1, 0, 0) },
      { distance: body.group.position.y - collider.min.y, normal: new Vector3(0, -1, 0) },
      { distance: collider.max.y - body.group.position.y, normal: new Vector3(0, 1, 0) },
      { distance: body.group.position.z - collider.min.z, normal: new Vector3(0, 0, -1) },
      { distance: collider.max.z - body.group.position.z, normal: new Vector3(0, 0, 1) },
    ];
    normal.copy(distances.reduce((nearest, candidate) => candidate.distance < nearest.distance ? candidate : nearest).normal);
  }

  body.group.position.addScaledVector(normal, body.radius - distance + 0.001);
  const velocityIntoSurface = body.velocity.dot(normal);
  if (velocityIntoSurface < 0) body.velocity.addScaledVector(normal, -1.58 * velocityIntoSurface);
  if (normal.y > 0.5) {
    body.velocity.x *= 0.94;
    body.velocity.z *= 0.94;
  }
}

function createInteractionPrompt() {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 240;
  const context = canvas.getContext("2d");
  let currentLabel = "";

  function drawPrompt(label: string) {
    if (!context || label === currentLabel) return;
    currentLabel = label;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.shadowColor = "#2457ff";
    context.shadowBlur = 18;
    context.fillStyle = "#f8fafa";
    context.font = "600 46px monospace";
    context.fillText(label, canvas.width / 2, 72);

    context.beginPath();
    const pointerX = canvas.width / 2;
    context.moveTo(pointerX - 34, 130);
    context.lineTo(pointerX + 34, 130);
    context.lineTo(pointerX, 196);
    context.closePath();
    context.fillStyle = "#d3dcdf";
    context.shadowBlur = 26;
    context.fill();
  }

  drawPrompt("TAP A TV TO VIEW");

  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const material = new SpriteMaterial({
    map: texture,
    color: "#f8fafa",
    depthTest: false,
    depthWrite: false,
    transparent: true,
  });
  const sprite = new Sprite(material);
  const baseY = 2.72;
  sprite.name = "InteractionPrompt";
  sprite.position.set(0, baseY, -0.12);
  sprite.scale.set(2.55, 0.8, 1);
  sprite.renderOrder = 20;

  return {
    sprite,
    material,
    baseY,
    setLabel: (label: string) => {
      drawPrompt(label);
      texture.needsUpdate = true;
    },
    dispose: () => {
      sprite.removeFromParent();
      texture.dispose();
      material.dispose();
    },
  };
}

async function loadGarageEnvironment(renderer: WebGLRenderer, scene: Scene) {
  try {
    const source = await new HDRLoader().loadAsync(`${import.meta.env.BASE_URL}environments/garage-1k.hdr`);
    const generator = new PMREMGenerator(renderer);
    generator.compileEquirectangularShader();
    const environment = generator.fromEquirectangular(source).texture;
    source.dispose();
    generator.dispose();
    scene.environment = environment;
    scene.environmentIntensity = 0.42;
    return {
      dispose: () => {
        if (scene.environment === environment) scene.environment = null;
        environment.dispose();
      },
    };
  } catch {
    return null;
  }
}

async function loadBasketballModel() {
  try {
    const result = await new GLTFLoader().loadAsync(
      `${import.meta.env.BASE_URL}models/basketball-cc0/basketball.glb`,
    );
    const group = result.scene;
    group.name = "Basketball-CC0";
    const modelSize = new Box3().setFromObject(group).getSize(new Vector3());
    const sourceDiameter = Math.max(modelSize.x, modelSize.y, modelSize.z);
    const displayDiameter = 0.82;
    group.scale.setScalar(displayDiameter / Math.max(sourceDiameter, 0.001));
    group.position.set(-2.88, -0.68, 0.42);
    group.rotation.set(0.12, -0.45, -0.18);
    group.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return {
      group,
      dispose: () => disposeObjectTree(group),
    };
  } catch {
    return null;
  }
}

async function loadIndustrialTable() {
  try {
    const result = await new GLTFLoader().loadAsync(
      `${import.meta.env.BASE_URL}models/industrial-coffee-table-cc0/industrial_coffee_table_1k.gltf`,
    );
    const group = result.scene;
    group.name = "IndustrialCoffeeTable-PolyHaven-CC0";
    group.updateMatrixWorld(true);
    const sourceBounds = new Box3().setFromObject(group);
    const sourceSize = sourceBounds.getSize(new Vector3());
    group.scale.set(
      5.9 / Math.max(sourceSize.x, 0.001),
      1.25 / Math.max(sourceSize.y, 0.001),
      1.85 / Math.max(sourceSize.z, 0.001),
    );
    group.updateMatrixWorld(true);
    const scaledBounds = new Box3().setFromObject(group);
    const scaledCenter = scaledBounds.getCenter(new Vector3());
    group.position.set(-scaledCenter.x, -1.14 - scaledBounds.min.y, TABLE_COLLIDER.centerZ - scaledCenter.z);
    group.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return { group, dispose: () => disposeObjectTree(group) };
  } catch {
    return null;
  }
}

async function loadPlayStation2Model() {
  try {
    const result = await new GLTFLoader().loadAsync(
      `${import.meta.env.BASE_URL}models/playstation2/playstation2.glb`,
    );
    const group = result.scene;
    group.name = "PlayStation2-Blendkit";
    group.updateMatrixWorld(true);
    const sourceBounds = new Box3().setFromObject(group);
    const sourceSize = sourceBounds.getSize(new Vector3());
    group.scale.setScalar(1.08 / Math.max(sourceSize.x, 0.001));
    group.updateMatrixWorld(true);
    const scaledBounds = new Box3().setFromObject(group);
    const scaledCenter = scaledBounds.getCenter(new Vector3());
    group.position.set(
      0.78 - scaledCenter.x,
      TABLE_COLLIDER.topY + 0.01 - scaledBounds.min.y,
      0.02 - scaledCenter.z,
    );
    group.rotation.y = -0.2;
    group.traverse((object) => {
      if (!(object instanceof Mesh)) return;
      object.castShadow = true;
      object.receiveShadow = true;
    });
    return { group, dispose: () => disposeObjectTree(group) };
  } catch {
    return null;
  }
}

async function loadRealisticTelevisions(channels: ChannelConfig[], disposed: () => boolean) {
  let loadedModels: Awaited<ReturnType<GLTFLoader["loadAsync"]>>[] = [];
  try {
    const results = await Promise.allSettled(channels.map(() => (
      new GLTFLoader().loadAsync(`${import.meta.env.BASE_URL}models/television-01/television-01.gltf`)
    )));
    loadedModels = results.flatMap((result) => result.status === "fulfilled" ? [result.value] : []);
    if (loadedModels.length !== channels.length || disposed()) {
      loadedModels.forEach((result) => disposeObjectTree(result.scene));
      return null;
    }
    const group = new Group();
    group.name = "RealisticTelevisionLineup";
    const variants = [
      { scale: 3.25, tint: "#aaa38e", y: 0.2, z: -0.46 },
      { scale: 3.15, tint: "#8d958b", y: 0.2, z: -0.72 },
      { scale: 3.45, tint: "#777d82", y: 0.2, z: -0.48 },
    ];

    loadedModels.forEach((result, index) => {
      const channel = channels[index];
      const variant = variants[index];
      const television = result.scene;
      television.name = `RealisticTelevision-${channel.id}`;
      television.position.set(channel.position[0], variant.y, variant.z);
      television.rotation.y = channel.rotationY;
      television.scale.setScalar(variant.scale);
      television.traverse((object) => {
        if (!(object instanceof Mesh)) return;
        object.castShadow = true;
        object.receiveShadow = true;
        const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material];
        const clonedMaterials = sourceMaterials.map((sourceMaterial) => {
          const cloned = sourceMaterial.clone();
          if ("color" in cloned && cloned.color instanceof Color) cloned.color.multiply(new Color(variant.tint));
          return cloned;
        });
        object.material = Array.isArray(object.material) ? clonedMaterials : clonedMaterials[0];
      });
      group.add(television);

      channel.asset.group.traverse((object) => {
        if (object instanceof Mesh && object !== channel.asset.screenPlane) object.visible = false;
      });
      channel.asset.screenPlane.scale.set(channel.screenFit.scale[0], channel.screenFit.scale[1], 1);
      channel.asset.screenPlane.position.x = channel.screenFit.offset[0];
      channel.asset.screenPlane.position.y = channel.screenFit.offset[1];
      channel.asset.screenPlane.position.z = 0.68;
    });

    return {
      group,
      dispose: () => disposeObjectTree(group),
    };
  } catch {
    loadedModels.forEach((result) => disposeObjectTree(result.scene));
    return null;
  }
}

function disposeObjectTree(root: Object3D) {
  root.traverse((object) => {
    if (!(object instanceof Mesh)) return;
    object.geometry.dispose();
    const materials = Array.isArray(object.material) ? object.material : [object.material];
    materials.forEach(disposeMaterial);
  });
  root.removeFromParent();
}

function disposeMaterial(material: Material) {
  Object.values(material).forEach((value) => {
    if (value && typeof value === "object" && "isTexture" in value) {
      (value as Texture).dispose();
    }
  });
  material.dispose();
}

function createScreenDisplay(label: string, subtitle: string): ScreenDisplay {
  const canvas = document.createElement("canvas");
  canvas.width = 768;
  canvas.height = 432;
  drawScreen(canvas, label, subtitle, 0);
  const texture = new CanvasTexture(canvas);
  texture.colorSpace = SRGBColorSpace;
  const material = new MeshBasicMaterial({ map: texture, toneMapped: false });
  return { canvas, texture, material, lastFrame: 0, hoverStartedAt: 0 };
}

function drawScreen(canvas: HTMLCanvasElement, label: string, subtitle: string, time: number) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const { width, height } = canvas;
  const gradient = context.createRadialGradient(width / 2, height / 2, 10, width / 2, height / 2, width * 0.68);
  gradient.addColorStop(0, "#183ba8");
  gradient.addColorStop(0.68, "#0b246f");
  gradient.addColorStop(1, "#050b22");
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);

  if (time > 0) {
    const rollY = (time * 0.19) % height;
    context.fillStyle = "rgba(186, 186, 186, .055)";
    context.fillRect(0, rollY, width, 28);
  }

  context.textAlign = "center";
  context.shadowColor = "#2457ff";
  context.shadowBlur = 6;
  context.fillStyle = "#f8fafa";
  context.font = "700 64px monospace";
  const visibleLabel = time > 0 && time < 260 ? scrambleScreenLabel(label, time) : label;
  context.fillText(visibleLabel, width / 2, height / 2 + 12);
  context.shadowBlur = 3;
  context.fillStyle = "#d3dcdf";
  context.font = "600 25px monospace";
  context.textAlign = "left";
  context.fillText(subtitle, 34, 42);

  context.shadowBlur = 0;
  context.fillStyle = "rgba(0, 18, 25, .16)";
  for (let y = 0; y < height; y += 6) context.fillRect(0, y, width, 1);
}

function drawScreenTransition(
  canvas: HTMLCanvasElement,
  source: HTMLCanvasElement,
  kind: ScreenTransitionKind,
  progress: number,
  reverse = false,
  hold = false,
) {
  const context = canvas.getContext("2d");
  if (!context) return;
  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  context.fillStyle = "#02040b";
  context.fillRect(0, 0, width, height);

  const phase = reverse ? 1 - progress : progress;

  if (kind === "pinch") {
    const verticalProgress = Math.min(phase / 0.72, 1);
    const horizontalProgress = Math.max((phase - 0.72) / 0.28, 0);
    const drawHeight = Math.max(2, height * (1 - verticalProgress * 0.985));
    const drawWidth = Math.max(3, width * (1 - horizontalProgress * 0.94));
    const x = (width - drawWidth) / 2;
    const y = (height - drawHeight) / 2;
    context.globalAlpha = 1 - horizontalProgress * 0.82;
    context.drawImage(source, x, y, drawWidth, drawHeight);
    context.globalAlpha = 1;
    context.fillStyle = `rgba(248, 250, 250, ${0.25 + verticalProgress * 0.7})`;
    context.shadowColor = "#2457ff";
    context.shadowBlur = 18;
    context.fillRect(x, height / 2 - 1, drawWidth, 2);
    context.shadowBlur = 0;
    return;
  }

  if (kind === "signal-acquisition") {
    context.drawImage(source, 0, 0, width, height);
    const noiseOpacity = hold ? 1 : reverse ? 1 - progress : progress;
    context.globalAlpha = noiseOpacity;
    context.imageSmoothingEnabled = false;
    const cell = 8;
    const phase = Math.floor(progress * 29);
    for (let y = 0; y < height; y += cell) {
      for (let x = 0; x < width; x += cell) {
        const noise = (x * 17 + y * 31 + phase * 47) % 101;
        const value = noise < 34 ? 24 : noise < 67 ? 112 : 224;
        context.fillStyle = `rgb(${value} ${value} ${value})`;
        context.fillRect(x, y, cell, cell);
      }
    }
    const bandY = ((progress * 2.8) % 1) * height;
    const band = context.createLinearGradient(0, bandY - 42, 0, bandY + 42);
    band.addColorStop(0, "rgba(248,250,250,0)");
    band.addColorStop(0.5, "rgba(248,250,250,.42)");
    band.addColorStop(1, "rgba(248,250,250,0)");
    context.fillStyle = band;
    context.fillRect(0, bandY - 42, width, 84);
    context.globalAlpha = 1;
    return;
  }

  const rollingPortion = 0.82;
  const rollProgress = Math.min(phase / rollingPortion, 1);
  const rollTurns = easeOutCubic(rollProgress) * 3;
  const wrappedOffset = -(rollTurns % 1) * height;
  const blankingProgress = Math.max((phase - rollingPortion) / (1 - rollingPortion), 0);

  context.globalAlpha = 1 - blankingProgress;
  context.drawImage(source, 0, wrappedOffset, width, height);
  context.drawImage(source, 0, wrappedOffset + height, width, height);

  const syncY = (wrappedOffset + height) % height;
  const blankingHeight = Math.max(12, height * 0.055);
  context.fillStyle = "rgba(2, 4, 11, .92)";
  context.fillRect(0, syncY - blankingHeight, width, blankingHeight);
  context.fillStyle = "rgba(248, 250, 250, .88)";
  context.shadowColor = "#2457ff";
  context.shadowBlur = 16;
  context.fillRect(0, syncY - 1, width, 2);
  context.shadowBlur = 0;
  context.globalAlpha = 1;
}

function scrambleScreenLabel(label: string, elapsed: number) {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const resolved = Math.floor(Math.min(elapsed / 260, 1) * label.length);
  return label.split("").map((character, index) => {
    if (character === " " || index < resolved) return character;
    return alphabet[(index * 7 + Math.floor(elapsed / 28)) % alphabet.length];
  }).join("");
}

function easeInOutCubic(value: number) {
  return value < 0.5 ? 4 * value * value * value : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}
