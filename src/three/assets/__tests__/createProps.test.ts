import { describe, expect, it } from "vitest";
import { Object3D } from "three";
import { createBasketball } from "../createBasketball";
import { createController } from "../createController";
import { createGameConsole } from "../createGameConsole";

describe("nostalgic prop assets", () => {
  it("creates a game console with stable metadata and named visible parts", () => {
    const asset = createGameConsole();

    expect(asset.group.name).toBe("GameConsole");
    expect(asset.group.userData.assetKind).toBe("prop");
    expect(asset.group.userData.assetVariant).toBe("game-console");

    expectVisibleParts(asset.group, [
      "ConsoleBody",
      "ConsoleCartridgeSlot",
      "ConsolePowerLed",
    ]);

    asset.dispose();
  });

  it("creates a wired controller with stable metadata and named visible parts", () => {
    const asset = createController();

    expect(asset.group.name).toBe("WiredController");
    expect(asset.group.userData.assetKind).toBe("prop");
    expect(asset.group.userData.assetVariant).toBe("wired-controller");

    expectVisibleParts(asset.group, [
      "ControllerBody",
      "ControllerDPad",
      "ControllerButtonA",
      "ControllerButtonB",
      "ControllerCord",
    ]);

    asset.dispose();
  });

  it("creates a basketball with stable metadata and named visible stripe parts", () => {
    const asset = createBasketball();

    expect(asset.group.name).toBe("Basketball");
    expect(asset.group.userData.assetKind).toBe("prop");
    expect(asset.group.userData.assetVariant).toBe("basketball");

    expectVisibleParts(asset.group, [
      "BasketballBody",
      "BasketballStripe1",
      "BasketballStripe2",
    ]);

    asset.dispose();
  });
});

function expectVisibleParts(group: Object3D, partNames: string[]) {
  partNames.forEach((partName) => {
    const part = group.getObjectByName(partName);

    expect(part).toBeInstanceOf(Object3D);
    expect(part?.visible).toBe(true);
  });
}
