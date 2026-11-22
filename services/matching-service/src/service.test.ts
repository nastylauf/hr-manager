import { describe, expect, it } from "vitest";
import type { Resume, Vacancy } from "@hr-manager/shared";
import { MatchingService } from "./service.js";

const resume: Resume = {
  id: "r1", fullName: "Анна Петрова", email: "anna@example.com", phone: "+7",
  position: "Developer", experience: 3, skills: ["TypeScript", "MongoDB"], salary: 180000
};
const vacancy: Vacancy = {
  id: "v1", title: "Developer", company: "Tech", description: "Описание",
  requiredSkills: ["typescript", "mongodb", "docker"], minExperience: 2, salary: 200000
};

describe("MatchingService", () => {
  it("начисляет очки за навыки и опыт детерминированно", () => {
    const service = new MatchingService({} as never, "", "");
    const match = service.calculate(resume, vacancy);
    expect(match.score).toBe(80);
    expect(match.matchedSkills).toEqual(["typescript", "mongodb"]);
  });

  it("не начисляет опытные очки ниже требования", () => {
    const service = new MatchingService({} as never, "", "");
    const match = service.calculate({ ...resume, experience: 1 }, vacancy);
    expect(match.score).toBe(60);
  });
});
