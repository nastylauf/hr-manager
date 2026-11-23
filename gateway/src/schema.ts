import { createYoga } from "graphql-yoga";
import { createSchema } from "graphql-yoga";

const resumeUrl = process.env.RESUME_SERVICE_URL ?? "http://resume-service:4001";
const vacancyUrl = process.env.VACANCY_SERVICE_URL ?? "http://vacancy-service:4002";
const matchingUrl = process.env.MATCHING_SERVICE_URL ?? "http://matching-service:4003";

async function requestJson<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error((body as { error?: string }).error ?? `HTTP ${response.status}`);
  return body as T;
}

export const yoga = createYoga({
  graphqlEndpoint: "/graphql",
  schema: createSchema({
    typeDefs: /* GraphQL */ `
      scalar Date

      type Resume {
        id: ID!
        fullName: String!
        email: String!
        phone: String!
        position: String!
        experience: Int!
        skills: [String!]!
        salary: Float!
      }

      type Vacancy {
        id: ID!
        title: String!
        company: String!
        description: String!
        requiredSkills: [String!]!
        minExperience: Int!
        salary: Float!
      }

      type Match {
        id: ID!
        resumeId: ID!
        vacancyId: ID!
        score: Int!
        matchedSkills: [String!]!
        createdAt: String!
        resume: Resume
        vacancy: Vacancy
      }

      input ResumeInput {
        fullName: String!
        email: String!
        phone: String!
        position: String!
        experience: Int!
        skills: [String!]!
        salary: Float!
      }

      input VacancyInput {
        title: String!
        company: String!
        description: String!
        requiredSkills: [String!]!
        minExperience: Int!
        salary: Float!
      }

      type Query {
        resumes(search: String, position: String, skill: String, minExperience: Int, maxSalary: Float): [Resume!]!
        resume(id: ID!): Resume
        vacancies(search: String, company: String, skill: String, maxSalary: Float, minExperience: Int): [Vacancy!]!
        vacancy(id: ID!): Vacancy
        matches(vacancyId: ID!): [Match!]!
      }

      type Mutation {
        createResume(input: ResumeInput!): Resume!
        updateResume(id: ID!, input: ResumeInput!): Resume
        deleteResume(id: ID!): Boolean!
        createVacancy(input: VacancyInput!): Vacancy!
        updateVacancy(id: ID!, input: VacancyInput!): Vacancy
        deleteVacancy(id: ID!): Boolean!
        calculateMatches(vacancyId: ID!): [Match!]!
      }
    `,
    resolvers: {
      Query: {
        resumes: (_: unknown, args: Record<string, unknown>) => {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(args)) if (value !== undefined) params.set(key, String(value));
          return requestJson(`${resumeUrl}/resumes?${params}`);
        },
        resume: (_: unknown, { id }: { id: string }) => requestJson(`${resumeUrl}/resumes/${id}`),
        vacancies: (_: unknown, args: Record<string, unknown>) => {
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(args)) if (value !== undefined) params.set(key, String(value));
          return requestJson(`${vacancyUrl}/vacancies?${params}`);
        },
        vacancy: (_: unknown, { id }: { id: string }) => requestJson(`${vacancyUrl}/vacancies/${id}`),
        matches: (_: unknown, { vacancyId }: { vacancyId: string }) =>
          requestJson(`${matchingUrl}/matches/${vacancyId}`)
      },
      Mutation: {
        createResume: (_: unknown, { input }: { input: unknown }) =>
          requestJson(`${resumeUrl}/resumes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
        updateResume: (_: unknown, { id, input }: { id: string; input: unknown }) =>
          requestJson(`${resumeUrl}/resumes/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
        deleteResume: (_: unknown, { id }: { id: string }) =>
          requestJson<{ success: boolean }>(`${resumeUrl}/resumes/${id}`, { method: "DELETE" }).then((value) => value.success),
        createVacancy: (_: unknown, { input }: { input: unknown }) =>
          requestJson(`${vacancyUrl}/vacancies`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
        updateVacancy: (_: unknown, { id, input }: { id: string; input: unknown }) =>
          requestJson(`${vacancyUrl}/vacancies/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) }),
        deleteVacancy: (_: unknown, { id }: { id: string }) =>
          requestJson<{ success: boolean }>(`${vacancyUrl}/vacancies/${id}`, { method: "DELETE" }).then((value) => value.success),
        calculateMatches: (_: unknown, { vacancyId }: { vacancyId: string }) =>
          requestJson(`${matchingUrl}/matches/${vacancyId}`, { method: "POST" })
      }
    }
  })
});
