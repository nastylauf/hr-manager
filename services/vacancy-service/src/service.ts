import type { Vacancy, VacancyFilters, VacancyInput } from "@hr-manager/shared";
import { validateVacancy } from "@hr-manager/shared";
import type { VacancyRepository } from "./repository.js";

export class VacancyService {
  constructor(private repository: VacancyRepository) {}
  list(filters: VacancyFilters): Promise<Vacancy[]> { return this.repository.list(filters); }
  findById(id: string): Promise<Vacancy | null> { return this.repository.findById(id); }
  async create(input: VacancyInput): Promise<Vacancy> {
    const errors = validateVacancy(input);
    if (errors.length) throw new ValidationError(errors);
    return this.repository.create(input);
  }
  async update(id: string, input: VacancyInput): Promise<Vacancy | null> {
    const errors = validateVacancy(input);
    if (errors.length) throw new ValidationError(errors);
    return this.repository.update(id, input);
  }
  delete(id: string): Promise<boolean> { return this.repository.delete(id); }
}

export class ValidationError extends Error {
  constructor(public readonly details: string[]) { super(details.join("; ")); }
}
