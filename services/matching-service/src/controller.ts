import type { IncomingMessage, ServerResponse } from "node:http";
import type { MatchingService } from "./service.js";

export class MatchingController {
  constructor(private service: MatchingService) {}
  async handle(request: IncomingMessage, response: ServerResponse): Promise<void> {
    const url = new URL(request.url ?? "/", "http://localhost");
    const parts = url.pathname.split("/").filter(Boolean);
    try {
      if (request.method === "GET" && parts[0] === "matches" && parts[1]) {
        this.send(response, 200, await this.service.listByVacancy(parts[1]));
      } else if (request.method === "POST" && parts[0] === "matches" && parts[1]) {
        this.send(response, 200, await this.service.matchVacancy(parts[1]));
      } else {
        this.send(response, 404, { error: "Маршрут не найден" });
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Внутренняя ошибка";
      this.send(response, message === "Внутренняя ошибка" ? 500 : 404, { error: message });
    }
  }
  private send(response: ServerResponse, status: number, body: unknown): void {
    response.writeHead(status, { "Content-Type": "application/json" });
    response.end(JSON.stringify(body));
  }
}
