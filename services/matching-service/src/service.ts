import type { Match, Resume, Vacancy } from "@hr-manager/shared";
import { normalizeSkills } from "@hr-manager/shared";
import type { MatchRepository } from "./repository.js";

export class MatchingService {
  constructor(private repository: MatchRepository, private resumeUrl: string, private vacancyUrl: string) {}

  async matchVacancy(vacancyId: string): Promise<Match[]> {
    const vacancy = await this.fetchJson<Vacancy>(`${this.vacancyUrl}/vacancies/${vacancyId}`);
    if (!vacancy) throw new NotFoundError("Вакансия не найдена");
    const resumes = await this.fetchJson<Resume[]>(`${this.resumeUrl}/resumes`) ?? [];
    const matches = resumes.map((resume) => this.calculate(resume, vacancy));
    matches.sort((a, b) => b.score - a.score);
    return this.repository.replaceForVacancy(vacancyId, matches.map((match) => ({ ...match, id: undefined as unknown as string })));
  }

  listByVacancy(vacancyId: string): Promise<Match[]> {
    return this.repository.listByVacancy(vacancyId);
  }

  calculate(resume: Resume, vacancy: Vacancy): Match {
    const resumeSkills = normalizeSkills(resume.skills);
    const requiredSkills = normalizeSkills(vacancy.requiredSkills);
    const matchedSkills = requiredSkills.filter((skill) => resumeSkills.includes(skill));
    const skillScore = requiredSkills.length ? (matchedSkills.length / requiredSkills.length) * 60 : 0;
    const experienceScore = resume.experience >= vacancy.minExperience
      ? 40
      : vacancy.minExperience === 0
        ? 40
        : Math.max(0, (resume.experience / vacancy.minExperience) * 40);
    return {
      id: "",
      resumeId: resume.id,
      vacancyId: vacancy.id,
      score: Math.round(skillScore + experienceScore),
      matchedSkills,
      createdAt: new Date().toISOString(),
      resume,
      vacancy
    };
  }

  private async fetchJson<T>(url: string): Promise<T | null> {
    const response = await fetch(url);
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`Внутренний сервис ответил с кодом ${response.status}`);
    return response.json() as Promise<T>;
  }
}

export class NotFoundError extends Error {}
