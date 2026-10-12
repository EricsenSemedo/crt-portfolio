import { describe, expect, it } from "vitest";
import { Box3, Object3D, Vector3 } from "three";
import { createGarageRoom } from "../createGarageRoom";
import { createTable, createTableColliders, TABLE_LAYOUT } from "../createTable";

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
    expect(asset.group.userData.assetVariant).toBe("media-console");

    asset.dispose();
  });

  it("includes visible tabletop and leg parts", () => {
    const asset = createTable();
    const requiredParts = [
      "TableTop",
      "TableCase",
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

  it("collides with the whole console, which the ball cannot roll under", () => {
    const asset = createTable();
    asset.group.position.set(0, TABLE_LAYOUT.topY, TABLE_LAYOUT.centerZ);
    const visible = new Box3().setFromObject(asset.group);
    const [collider] = createTableColliders();

    expect(collider.containsBox(visible)).toBe(true);
    expect(collider.max.y).toBeCloseTo(TABLE_LAYOUT.topY);
    expect(collider.min.y).toBeCloseTo(TABLE_LAYOUT.floorY);
    expect(TABLE_LAYOUT.legHeight).toBeLessThan(0.82); // the basketball's diameter
    expect(collider.containsPoint(new Vector3(0, TABLE_LAYOUT.floorY + 0.2, TABLE_LAYOUT.centerZ))).toBe(true);

    asset.dispose();
  });
});
