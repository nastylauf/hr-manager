import type { Resume, ResumeFilters, ResumeInput } from "@hr-manager/shared";
import { validateResume } from "@hr-manager/shared";
import type { ResumeRepository } from "./repository.js";

export class ResumeService {
  constructor(private repository: ResumeRepository) {}

  list(filters: ResumeFilters): Promise<Resume[]> {
    return this.repository.list(filters);
  }

  findById(id: string): Promise<Resume | null> {
    return this.repository.findById(id);
  }

  async create(input: ResumeInput): Promise<Resume> {
    const errors = validateResume(input);
    if (errors.length) throw new ValidationError(errors);
    return this.repository.create(input);
  }

  async update(id: string, input: ResumeInput): Promise<Resume | null> {
    const errors = validateResume(input);
    if (errors.length) throw new ValidationError(errors);
    return this.repository.update(id, input);
  }

  delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}

export class ValidationError extends Error {
  constructor(public readonly details: string[]) {
    super(details.join("; "));
  }
}
