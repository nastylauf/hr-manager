import type { Resume } from "@hr-manager/shared";
import type { ObjectId } from "mongodb";

export interface ResumeDocument extends Resume {
  _id?: ObjectId;
}
