import http from "node:http";
import { VacancyRepository } from "./repository.js";
import { VacancyService } from "./service.js";
import { VacancyController } from "./controller.js";

const port = Number(process.env.PORT ?? 4002);
const repository = await VacancyRepository.connect(process.env.MONGO_URI ?? "mongodb://mongo:27017", "hr_vacancy");
const controller = new VacancyController(new VacancyService(repository));

const server = http.createServer(async (request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "ok", service: "vacancy" }));
    return;
  }
  await controller.handle(request, response);
});
server.listen(port, "0.0.0.0", () => console.log(`Vacancy Service listening on ${port}`));
