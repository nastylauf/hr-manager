import type { IncomingMessage, ServerResponse } from "node:http";
import type { ResumeInput } from "@hr-manager/shared";
import type { ResumeService, ValidationError } from "./service.js";

export class ResumeController {
  constructor(private service: ResumeService) {}

  async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? "/", "http://localhost");
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[1];

    try {
      if (request.method === "GET" && !id) {
        const filters = {
          search: url.searchParams.get("search") ?? undefined,
          position: url.searchParams.get("position") ?? undefined,
          skill: url.searchParams.get("skill") ?? undefined,
          minExperience: this.number(url.searchParams.get("minExperience")),
          maxSalary: this.number(url.searchParams.get("maxSalary"))
        };
        this.send(response, 200, await this.service.list(filters));
      } else if (request.method === "GET" && id) {
        const resume = await this.service.findById(id);
        this.send(response, resume ? 200 : 404, resume ?? { error: "Резюме не найдено" });
      } else if (request.method === "POST") {
        const resume = await this.service.create(await this.body(request) as ResumeInput);
        this.send(response, 201, resume);
      } else if (request.method === "PUT" && id) {
        const resume = await this.service.update(id, await this.body(request) as ResumeInput);
        this.send(response, resume ? 200 : 404, resume ?? { error: "Резюме не найдено" });
      } else if (request.method === "DELETE" && id) {
        const deleted = await this.service.delete(id);
        this.send(response, deleted ? 200 : 404, deleted ? { success: true } : { error: "Резюме не найдено" });
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
