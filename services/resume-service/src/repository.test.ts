import { describe, expect, it, vi } from "vitest";
import { ResumeRepository } from "./repository.js";

describe("ResumeRepository", () => {
  it("finds resumes matching any provided filter", async () => {
    const cursor = { sort: vi.fn().mockReturnThis(), toArray: vi.fn().mockResolvedValue([]) };
    const collection = { find: vi.fn().mockReturnValue(cursor) };
    const repository = new ResumeRepository(collection as never);

    await repository.list({ position: "Engineer", minExperience: 3 });

    expect(collection.find).toHaveBeenCalledWith({
      $or: [
        { position: { $regex: "Engineer", $options: "i" } },
        { experience: { $gte: 3 } }
      ]
    });
  });

  it("treats search text literally in a single filter", async () => {
    const cursor = { sort: vi.fn().mockReturnThis(), toArray: vi.fn().mockResolvedValue([]) };
    const collection = { find: vi.fn().mockReturnValue(cursor) };
    const repository = new ResumeRepository(collection as never);

    await repository.list({ skill: "C++" });

    expect(collection.find).toHaveBeenCalledWith({
      skills: { $regex: "^C\\+\\+$", $options: "i" }
    });
  });
});
