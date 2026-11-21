import http from "node:http";
import { ResumeRepository } from "./repository.js";
import { ResumeService } from "./service.js";
import { ResumeController } from "./controller.js";

const port = Number(process.env.PORT ?? 4001);
const mongoUri = process.env.MONGO_URI ?? "mongodb://mongo:27017";
const repository = await ResumeRepository.connect(mongoUri, "hr_resume");
const controller = new ResumeController(new ResumeService(repository));

const server = http.createServer(async (request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "ok", service: "resume" }));
    return;
  }
  await controller.handle(request, response);
});

server.listen(port, "0.0.0.0", () => console.log(`Resume Service listening on ${port}`));
