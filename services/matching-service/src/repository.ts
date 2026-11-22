import { Collection, MongoClient, ObjectId } from "mongodb";
import type { Match } from "@hr-manager/shared";
import type { MatchDocument } from "./model.js";

export class MatchRepository {
  constructor(private collection: Collection<MatchDocument>) {}
  static async connect(uri: string, dbName: string): Promise<MatchRepository> {
    const client = new MongoClient(uri);
    await client.connect();
    return new MatchRepository(client.db(dbName).collection<MatchDocument>("matches"));
  }
  async replaceForVacancy(vacancyId: string, matches: Omit<Match, "id">[]): Promise<Match[]> {
    await this.collection.deleteMany({ vacancyId });
    if (!matches.length) return [];
    const documents = matches.map((match) => ({ ...match, createdAt: new Date(match.createdAt) })) as unknown as MatchDocument[];
    const result = await this.collection.insertMany(documents);
    return matches.map((match, index) => ({ ...match, id: result.insertedIds[index].toHexString() }));
  }
  async listByVacancy(vacancyId: string): Promise<Match[]> {
    const documents = await this.collection.find({ vacancyId }).sort({ score: -1 }).toArray();
    return documents.map((document) => ({
      ...document,
      id: String(document._id),
      createdAt: String(document.createdAt)
    }));
  }
}
