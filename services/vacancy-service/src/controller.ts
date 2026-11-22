import type { IncomingMessage, ServerResponse } from "node:http";
import type { VacancyInput } from "@hr-manager/shared";
import type { VacancyService, ValidationError } from "./service.js";

export class VacancyController {
  constructor(private service: VacancyService) {}
  async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? "/", "http://localhost");
    const id = url.pathname.split("/").filter(Boolean)[1];
    try {
      if (request.method === "GET" && !id) {
        const filters = {
          search: url.searchParams.get("search") ?? undefined,
          company: url.searchParams.get("company") ?? undefined,
          skill: url.searchParams.get("skill") ?? undefined,
          maxSalary: this.number(url.searchParams.get("maxSalary")),
          minExperience: this.number(url.searchParams.get("minExperience"))
        };
        this.send(response, 200, await this.service.list(filters));
      } else if (request.method === "GET" && id) {
        const vacancy = await this.service.findById(id);
        this.send(response, vacancy ? 200 : 404, vacancy ?? { error: "Вакансия не найдена" });
      } else if (request.method === "POST") {
        this.send(response, 201, await this.service.create(await this.body(request) as VacancyInput));
      } else if (request.method === "PUT" && id) {
        const vacancy = await this.service.update(id, await this.body(request) as VacancyInput);
        this.send(response, vacancy ? 200 : 404, vacancy ?? { error: "Вакансия не найдена" });
      } else if (request.method === "DELETE" && id) {
        const deleted = await this.service.delete(id);
        this.send(response, deleted ? 200 : 404, deleted ? { success: true } : { error: "Вакансия не найдена" });
      } else {
        this.send(response, 404, { error: "Маршрут не найден" });
      }
    } catch (error) {
      const validation = error as ValidationError;
      this.send(response, 400, { error: validation.details?.join("; ") ?? "Некорректный запрос" });
    }
  }
  private number(value: string | null): number | undefined {
    return value === null || value === "" ? undefined : Number(value);
  }
  private async body(request: IncomingMessage): Promise<unknown> {
    let raw = "";
    for await (const chunk of request) raw += chunk;
    return JSON.parse(raw || "{}");
  }
  private send(response: ServerResponse, status: number, body: unknown): void {
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(body));
  }
}
