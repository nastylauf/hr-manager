import http from "node:http";
import { MatchRepository } from "./repository.js";
import { MatchingService } from "./service.js";
import { MatchingController } from "./controller.js";

const port = Number(process.env.PORT ?? 4003);
const repository = await MatchRepository.connect(process.env.MONGO_URI ?? "mongodb://mongo:27017", "hr_matching");
const resumeUrl = process.env.RESUME_SERVICE_URL ?? "http://resume-service:4001";
const vacancyUrl = process.env.VACANCY_SERVICE_URL ?? "http://vacancy-service:4002";
const controller = new MatchingController(new MatchingService(repository, resumeUrl, vacancyUrl));

const server = http.createServer(async (request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "ok", service: "matching" }));
    return;
  }
  await controller.handle(request, response);
});
server.listen(port, "0.0.0.0", () => console.log(`Matching Service listening on ${port}`));
