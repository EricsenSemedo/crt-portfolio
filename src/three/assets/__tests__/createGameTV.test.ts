import { describe, expect, it } from "vitest";
import { Box3, Object3D, PointLight } from "three";
import { createGameTV } from "../createGameTV";

describe("createGameTV", () => {
  it("creates a reusable game CRT group with stable metadata", () => {
    const asset = createGameTV();

    expect(asset.group.name).toBe("GameTV");
    expect(asset.group.userData.assetKind).toBe("crt-tv");
    expect(asset.group.userData.assetVariant).toBe("game");

    asset.dispose();
  });

  it("exposes named anchors for future camera and model replacement work", () => {
    const asset = createGameTV();

    expect(asset.group.getObjectByName("ScreenAnchor")).toBe(asset.screenAnchor);
    expect(asset.group.getObjectByName("ScreenPlane")).toBe(asset.screenPlane);
    expect(asset.group.getObjectByName("CameraTarget")).toBe(asset.cameraTarget);
    expect(asset.group.getObjectByName("HoverLight")).toBe(asset.hoverLight);
    expect(asset.hoverLight).toBeInstanceOf(PointLight);

    expect(asset.screenAnchor.position.z).toBeGreaterThan(0.5);
    expect(asset.cameraTarget.position.z).toBeGreaterThan(asset.screenAnchor.position.z);

    asset.dispose();
  });

  it("includes the game-specific shell details", () => {
    const asset = createGameTV();
    const requiredParts = [
      "CartridgeSlot",
      "InsertedCartridge",
      "ControllerPort",
      "PowerLed",
    ];

    requiredParts.forEach((partName) => {
      expect(asset.group.getObjectByName(partName)).toBeInstanceOf(Object3D);
    });

    asset.dispose();
  });

  it("uses a wider low shell with cartridge hardware above the control deck", () => {
    const asset = createGameTV();
    const bounds = new Box3().setFromObject(asset.group);
    const size = bounds.getSize(asset.group.position.clone());
    const cartridge = asset.group.getObjectByName("InsertedCartridge");
    const controlDeck = asset.group.getObjectByName("ControlDeck");

    expect(size.x).toBeGreaterThan(3);
    expect(size.x).toBeGreaterThan(size.y);
    expect(cartridge?.position.y).toBeGreaterThan(controlDeck?.position.y ?? 0);
    expect(cartridge?.position.x).toBeGreaterThan(asset.screenAnchor.position.x);

    asset.dispose();
  });

  it("keeps game controls right and below the screen instead of copying VHS controls", () => {
    const asset = createGameTV();
    const controlDeck = asset.group.getObjectByName("ControlDeck");
    const controllerPort = asset.group.getObjectByName("ControllerPort");
    const powerLed = asset.group.getObjectByName("PowerLed");

    expect(controlDeck).toBeDefined();
    expect(controllerPort).toBeDefined();
    expect(powerLed).toBeDefined();
    expect(asset.group.getObjectByName("RightControlPanel")).toBeUndefined();
    expect(asset.group.getObjectByName("VhsTapeSlot")).toBeUndefined();
    expect(asset.group.getObjectByName("TuningKnob")).toBeUndefined();

    expect(asset.screenAnchor.position.x).toBeLessThan(controlDeck?.position.x ?? 0);
    expect(controllerPort?.position.y).toBeLessThan(asset.screenAnchor.position.y);
    expect(powerLed?.position.y).toBeGreaterThan(controllerPort?.position.y ?? 0);

    asset.dispose();
  });
});
