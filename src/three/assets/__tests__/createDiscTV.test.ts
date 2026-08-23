import { describe, expect, it } from "vitest";
import { Mesh, Object3D, PointLight } from "three";
import { createDiscTV } from "../createDiscTV";

describe("createDiscTV", () => {
  it("creates a reusable disc CRT group with stable metadata", () => {
    const asset = createDiscTV();

    expect(asset.group.name).toBe("DiscTV");
    expect(asset.group.userData.assetKind).toBe("crt-tv");
    expect(asset.group.userData.assetVariant).toBe("disc");

    asset.dispose();
  });

  it("exposes named anchors for future camera and model replacement work", () => {
    const asset = createDiscTV();

    expect(asset.group.getObjectByName("ScreenAnchor")).toBe(asset.screenAnchor);
    expect(asset.group.getObjectByName("ScreenPlane")).toBe(asset.screenPlane);
    expect(asset.group.getObjectByName("CameraTarget")).toBe(asset.cameraTarget);
    expect(asset.group.getObjectByName("HoverLight")).toBe(asset.hoverLight);
    expect(asset.hoverLight).toBeInstanceOf(PointLight);

    expect(asset.screenPlane.parent).toBe(asset.screenAnchor);
    expect(asset.screenAnchor.position.z).toBeGreaterThan(0.6);
    expect(asset.cameraTarget.position.z).toBeGreaterThan(asset.screenAnchor.position.z);

    asset.dispose();
  });

  it("includes disc-specific details and a non-VHS top detail", () => {
    const asset = createDiscTV();
    const requiredParts = [
      "DiscTray",
      "DiscTrayButton",
      "CompactDisc",
      "CompactDiscHub",
      "LoopAntennaBase",
      "SignalLoopAntenna",
    ];

    requiredParts.forEach((partName) => {
      expect(asset.group.getObjectByName(partName)).toBeInstanceOf(Object3D);
    });

    expect(asset.group.getObjectByName("LeftRabbitEar")).toBeUndefined();
    expect(asset.group.getObjectByName("RightRabbitEar")).toBeUndefined();

    asset.dispose();
  });

  it("keeps the screen, controls, and disc tray in a stable front layout", () => {
    const asset = createDiscTV();
    const controlPanel = asset.group.getObjectByName("DiscControlPanel");
    const discTray = asset.group.getObjectByName("DiscTray");
    const discTrayButton = asset.group.getObjectByName("DiscTrayButton");
    const compactDisc = asset.group.getObjectByName("CompactDisc");
    const shell = asset.group.getObjectByName("ShellBody") as Mesh | undefined;

    expect(controlPanel).toBeDefined();
    expect(discTray).toBeDefined();
    expect(discTrayButton).toBeDefined();
    expect(compactDisc).toBeDefined();
    expect(shell).toBeInstanceOf(Mesh);

    expect(asset.screenAnchor.position.x).toBeLessThan(controlPanel?.position.x ?? 0);
    expect(discTray?.position.y).toBeLessThan(asset.screenAnchor.position.y);
    expect(discTrayButton?.position.x).toBeGreaterThan(discTray?.position.x ?? 0);
    expect(compactDisc?.position.z).toBeGreaterThan(discTray?.position.z ?? 0);

    const shellBox = shell?.geometry.boundingBox;
    shell?.geometry.computeBoundingBox();
    const computedShellBox = shell?.geometry.boundingBox ?? shellBox;

    expect(computedShellBox?.max.x).toBeGreaterThan(1);
    expect(computedShellBox?.max.y).toBeLessThan(0.9);

    asset.dispose();
  });
});
