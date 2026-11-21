export interface Resume {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  experience: number;
  skills: string[];
  salary: number;
}

export interface Vacancy {
  id: string;
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  minExperience: number;
  salary: number;
}

export interface Match {
  id: string;
  resumeId: string;
  vacancyId: string;
  score: number;
  matchedSkills: string[];
  createdAt: string;
  resume?: Resume;
  vacancy?: Vacancy;
}

export type ResumeInput = Omit<Resume, "id">;
export type VacancyInput = Omit<Vacancy, "id">;

export interface ResumeFilters {
  search?: string;
  position?: string;
  skill?: string;
  minExperience?: number;
  maxSalary?: number;
}

export interface VacancyFilters {
  search?: string;
  company?: string;
  skill?: string;
  maxSalary?: number;
  minExperience?: number;
}

export function normalizeSkills(skills: string[]): string[] {
  return [...new Set(skills.map((skill) => skill.trim().toLowerCase()).filter(Boolean))];
}

export function validateResume(input: Partial<ResumeInput>): string[] {
  const errors: string[] = [];
  if (!input.fullName?.trim()) errors.push("Укажите ФИО");
  if (!input.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)) errors.push("Некорректный email");
  if (!input.phone?.trim()) errors.push("Укажите телефон");
  if (!input.position?.trim()) errors.push("Укажите должность");
  if (input.experience === undefined || input.experience < 0 || input.experience > 60) errors.push("Опыт должен быть от 0 до 60 лет");
  if (!input.skills?.length) errors.push("Укажите хотя бы один навык");
  if (input.salary === undefined || input.salary < 0) errors.push("Зарплата не может быть отрицательной");
  return errors;
}

export function validateVacancy(input: Partial<VacancyInput>): string[] {
  const errors: string[] = [];
  if (!input.title?.trim()) errors.push("Укажите название должности");
  if (!input.company?.trim()) errors.push("Укажите компанию");
  if (!input.description?.trim()) errors.push("Укажите описание");
  if (!input.requiredSkills?.length) errors.push("Укажите требуемые навыки");
  if (input.minExperience === undefined || input.minExperience < 0 || input.minExperience > 60) errors.push("Опыт должен быть от 0 до 60 лет");
  if (input.salary === undefined || input.salary < 0) errors.push("Зарплата не может быть отрицательной");
  return errors;
}
