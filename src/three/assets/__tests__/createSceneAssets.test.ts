import { describe, expect, it } from "vitest";
import { Object3D } from "three";
import { createGarageRoom } from "../createGarageRoom";
import { createTable } from "../createTable";

describe("createGarageRoom", () => {
  it("creates a scene group with stable metadata", () => {
    const asset = createGarageRoom();

    expect(asset.group.name).toBe("GarageRoom");
    expect(asset.group.userData.assetKind).toBe("scene");
    expect(asset.group.userData.assetVariant).toBe("sunset-garage");

    asset.dispose();
  });

  it("includes visible room planes and subtle detail parts", () => {
    const asset = createGarageRoom();
    const requiredParts = [
      "GarageStructure",
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
