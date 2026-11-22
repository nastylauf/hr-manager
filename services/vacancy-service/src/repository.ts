import { Collection, MongoClient, ObjectId } from "mongodb";
import type { Vacancy, VacancyFilters, VacancyInput } from "@hr-manager/shared";
import { normalizeSkills } from "@hr-manager/shared";
import type { VacancyDocument } from "./model.js";

export class VacancyRepository {
  constructor(private collection: Collection<VacancyDocument>) {}

  static async connect(uri: string, dbName: string): Promise<VacancyRepository> {
    const client = new MongoClient(uri);
    await client.connect();
    return new VacancyRepository(client.db(dbName).collection<VacancyDocument>("vacancies"));
  }

  async list(filters: VacancyFilters = {}): Promise<Vacancy[]> {
    const query: Record<string, unknown> = {};
    if (filters.company) query.company = { $regex: filters.company, $options: "i" };
    if (filters.skill) query.requiredSkills = { $regex: `^${filters.skill}$`, $options: "i" };
    if (filters.search) {
      query.$or = [
        { title: { $regex: filters.search, $options: "i" } },
        { company: { $regex: filters.search, $options: "i" } },
        { description: { $regex: filters.search, $options: "i" } },
        { requiredSkills: { $regex: filters.search, $options: "i" } }
      ];
    }
    if (filters.maxSalary !== undefined) query.salary = { $lte: filters.maxSalary };
    if (filters.minExperience !== undefined) query.minExperience = { $lte: filters.minExperience };
    return (await this.collection.find(query).sort({ title: 1 }).toArray()).map(this.toVacancy);
  }

  async findById(id: string): Promise<Vacancy | null> {
    if (!ObjectId.isValid(id)) return null;
    const document = await this.collection.findOne({ _id: new ObjectId(id) });
    return document ? this.toVacancy(document) : null;
  }

  async create(input: VacancyInput): Promise<Vacancy> {
    const document = { ...input, requiredSkills: normalizeSkills(input.requiredSkills) };
    const result = await this.collection.insertOne(document as VacancyDocument);
    return { ...document, id: result.insertedId.toHexString() };
  }

  async update(id: string, input: VacancyInput): Promise<Vacancy | null> {
    if (!ObjectId.isValid(id)) return null;
    const document = { ...input, requiredSkills: normalizeSkills(input.requiredSkills) };
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: document },
      { returnDocument: "after" }
    );
    return result ? this.toVacancy(result) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    return (await this.collection.deleteOne({ _id: new ObjectId(id) })).deletedCount === 1;
  }

  private toVacancy(document: VacancyDocument): Vacancy {
    return {
      id: String(document._id),
      title: document.title,
      company: document.company,
      description: document.description,
      requiredSkills: document.requiredSkills,
      minExperience: document.minExperience,
      salary: document.salary
    };
  }
}
