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
    const query: Record<string, unknown> = {};
    if (filters.position) query.position = { $regex: filters.position, $options: "i" };
    if (filters.skill) query.skills = { $regex: `^${filters.skill}$`, $options: "i" };
    if (filters.search) {
      query.$or = [
        { fullName: { $regex: filters.search, $options: "i" } },
        { position: { $regex: filters.search, $options: "i" } },
        { skills: { $regex: filters.search, $options: "i" } }
      ];
    }
    if (filters.minExperience !== undefined) query.experience = { $gte: filters.minExperience };
    if (filters.maxSalary !== undefined) query.salary = { $lte: filters.maxSalary };
    return (await this.collection.find(query).sort({ fullName: 1 }).toArray()).map(this.toResume);
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
