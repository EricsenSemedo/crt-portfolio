import { describe, expect, it } from "vitest";
import { Object3D, PointLight } from "three";
import { createVhsTV } from "../createVhsTV";

describe("createVhsTV", () => {
  it("creates a reusable VHS CRT group with stable metadata", () => {
    const asset = createVhsTV();

    expect(asset.group.name).toBe("VhsTV");
    expect(asset.group.userData.assetKind).toBe("crt-tv");
    expect(asset.group.userData.assetVariant).toBe("vhs");

    asset.dispose();
  });

  it("exposes named anchors for future camera and model replacement work", () => {
    const asset = createVhsTV();

    expect(asset.group.getObjectByName("ScreenAnchor")).toBe(asset.screenAnchor);
    expect(asset.group.getObjectByName("ScreenPlane")).toBe(asset.screenPlane);
    expect(asset.group.getObjectByName("CameraTarget")).toBe(asset.cameraTarget);
    expect(asset.group.getObjectByName("HoverLight")).toBe(asset.hoverLight);
    expect(asset.hoverLight).toBeInstanceOf(PointLight);

    expect(asset.screenAnchor.position.z).toBeGreaterThan(0.55);
    expect(asset.cameraTarget.position.z).toBeGreaterThan(asset.screenAnchor.position.z);

    asset.dispose();
  });

  it("includes the VHS-specific shell details", () => {
    const asset = createVhsTV();
    const requiredParts = [
      "VhsTapeSlot",
      "VhsSlotLabel",
      "TuningKnob",
      "VolumeKnob",
      "AntennaBase",
      "LeftRabbitEar",
      "RightRabbitEar",
    ];

    requiredParts.forEach((partName) => {
      expect(asset.group.getObjectByName(partName)).toBeInstanceOf(Object3D);
    });

    asset.dispose();
  });

  it("keeps the screen offset to the left of the control panel", () => {
    const asset = createVhsTV();
    const controlPanel = asset.group.getObjectByName("RightControlPanel");

    expect(controlPanel).toBeDefined();
    expect(asset.screenAnchor.position.x).toBeLessThan(controlPanel?.position.x ?? 0);

    asset.dispose();
  });
});
