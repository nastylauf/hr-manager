import { describe, expect, it } from "vitest";
import type { Resume, ResumeInput } from "@hr-manager/shared";
import { ResumeService, ValidationError } from "./service.js";

const valid: ResumeInput = {
  fullName: "Иван Иванов",
  email: "ivan@example.com",
  phone: "+7 900 000-00-00",
  position: "TypeScript разработчик",
  experience: 3,
  skills: ["typescript", "mongodb"],
  salary: 180000
};

describe("ResumeService", () => {
  it("создаёт валидное резюме", async () => {
    const repository = {
      create: async (input: ResumeInput): Promise<Resume> => ({ id: "1", ...input })
    };
    const service = new ResumeService(repository as never);
    expect((await service.create(valid)).fullName).toBe("Иван Иванов");
  });

  it("отклоняет некорректный email и опыт", async () => {
    const service = new ResumeService({} as never);
    await expect(service.create({ ...valid, email: "bad", experience: -1 })).rejects.toBeInstanceOf(ValidationError);
  });
});
