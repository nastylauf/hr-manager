import type { Match } from "@hr-manager/shared";
import type { ObjectId } from "mongodb";
export interface MatchDocument extends Match { _id?: ObjectId }
