import { describe, expect, it } from "vitest";
import { Object3D } from "three";
import { createBasementRoom } from "../createBasementRoom";
import { createTable } from "../createTable";

describe("createBasementRoom", () => {
  it("creates a scene group with stable metadata", () => {
    const asset = createBasementRoom();

    expect(asset.group.name).toBe("BasementRoom");
    expect(asset.group.userData.assetKind).toBe("scene");
    expect(asset.group.userData.assetVariant).toBe("basement-room");

    asset.dispose();
  });

  it("includes visible room planes and subtle detail parts", () => {
    const asset = createBasementRoom();
    const requiredParts = [
      "FloorPlane",
      "BackWall",
      "LeftWall",
      "RightWall",
      "FloorGrid",
      "WallPanel1",
    ];

    requiredParts.forEach((partName) => {
      const part = asset.group.getObjectByName(partName);

      expect(part).toBeInstanceOf(Object3D);
      expect(part?.visible).toBe(true);
    });

    asset.dispose();
  });
});

describe("createTable", () => {
  it("creates a furniture group with stable metadata", () => {
    const asset = createTable();

    expect(asset.group.name).toBe("BasementTable");
    expect(asset.group.userData.assetKind).toBe("furniture");
    expect(asset.group.userData.assetVariant).toBe("long-table");

    asset.dispose();
  });

  it("includes visible tabletop and leg parts", () => {
    const asset = createTable();
    const requiredParts = [
      "TableTop",
      "TableLegFrontLeft",
      "TableLegFrontRight",
      "TableLegBackLeft",
      "TableLegBackRight",
    ];

    requiredParts.forEach((partName) => {
      const part = asset.group.getObjectByName(partName);

      expect(part).toBeInstanceOf(Object3D);
      expect(part?.visible).toBe(true);
    });

    asset.dispose();
  });
});
