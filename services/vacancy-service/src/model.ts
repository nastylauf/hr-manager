import type { Vacancy } from "@hr-manager/shared";
import type { ObjectId } from "mongodb";
export interface VacancyDocument extends Vacancy { _id?: ObjectId }
