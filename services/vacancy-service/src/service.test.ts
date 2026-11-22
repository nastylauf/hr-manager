import { describe, expect, it } from "vitest";
import type { Vacancy, VacancyInput } from "@hr-manager/shared";
import { VacancyService, ValidationError } from "./service.js";

const valid: VacancyInput = {
  title: "Backend разработчик",
  company: "Техно",
  description: "Разработка серверных приложений",
  requiredSkills: ["typescript", "mongodb"],
  minExperience: 2,
  salary: 200000
};

describe("VacancyService", () => {
  it("создаёт валидную вакансию", async () => {
    const repository = { create: async (input: VacancyInput): Promise<Vacancy> => ({ id: "1", ...input }) };
    const service = new VacancyService(repository as never);
    expect((await service.create(valid)).title).toBe("Backend разработчик");
  });

  it("отклоняет отрицательный опыт", async () => {
    const service = new VacancyService({} as never);
    await expect(service.create({ ...valid, minExperience: -1 })).rejects.toBeInstanceOf(ValidationError);
  });
});
