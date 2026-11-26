import { Collection, MongoClient, ObjectId } from "mongodb";
import type { ResumeFilters, Resume, ResumeInput } from "@hr-manager/shared";
import { normalizeSkills } from "@hr-manager/shared";
import type { ResumeDocument } from "./model.js";

export class ResumeRepository {
  constructor(private collection: Collection<ResumeDocument>) {}

  static async connect(uri: string, dbName: string): Promise<ResumeRepository> {
    const client = new MongoClient(uri);
    await client.connect();
    const collection = client.db(dbName).collection<ResumeDocument>("resumes");
    return new ResumeRepository(collection);
  }

  async list(filters: ResumeFilters = {}): Promise<Resume[]> {
    const criteria: Record<string, unknown>[] = [];
    if (filters.position?.trim()) {
      criteria.push({ position: { $regex: this.escapeRegex(filters.position.trim()), $options: "i" } });
    }
    if (filters.skill?.trim()) {
      criteria.push({ skills: { $regex: `^${this.escapeRegex(filters.skill.trim())}$`, $options: "i" } });
    }
    if (filters.search?.trim()) {
      const search = this.escapeRegex(filters.search.trim());
      criteria.push({
        $or: [
          { fullName: { $regex: search, $options: "i" } },
          { position: { $regex: search, $options: "i" } },
          { skills: { $regex: search, $options: "i" } }
        ]
      });
    }
    if (filters.minExperience !== undefined) criteria.push({ experience: { $gte: filters.minExperience } });
    if (filters.maxSalary !== undefined) criteria.push({ salary: { $lte: filters.maxSalary } });
    const query = criteria.length > 1 ? { $or: criteria } : criteria[0] ?? {};
    return (await this.collection.find(query).sort({ fullName: 1 }).toArray()).map(this.toResume);
  }

  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  async findById(id: string): Promise<Resume | null> {
    if (!ObjectId.isValid(id)) return null;
    const document = await this.collection.findOne({ _id: new ObjectId(id) });
    return document ? this.toResume(document) : null;
  }

  async create(input: ResumeInput): Promise<Resume> {
    const document = { ...input, skills: normalizeSkills(input.skills) };
    const result = await this.collection.insertOne(document as ResumeDocument);
    return { ...document, id: result.insertedId.toHexString() };
  }

  async update(id: string, input: ResumeInput): Promise<Resume | null> {
    if (!ObjectId.isValid(id)) return null;
    const document = { ...input, skills: normalizeSkills(input.skills) };
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: document },
      { returnDocument: "after" }
    );
    return result ? this.toResume(result) : null;
  }

  async delete(id: string): Promise<boolean> {
    if (!ObjectId.isValid(id)) return false;
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount === 1;
  }

  private toResume(document: ResumeDocument): Resume {
    return {
      id: String(document._id),
      fullName: document.fullName,
      email: document.email,
      phone: document.phone,
      position: document.position,
      experience: document.experience,
      skills: document.skills,
      salary: document.salary
    };
  }
}
