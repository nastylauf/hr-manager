export interface CreateVacancyDto {
  title: string;
  company: string;
  description: string;
  requiredSkills: string[];
  minExperience: number;
  salary: number;
}
