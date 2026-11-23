import { createServer } from "node:http";
import { yoga } from "./schema.js";

const port = Number(process.env.PORT ?? 4000);
const server = createServer((request, response) => {
  if (request.url === "/health") {
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ status: "ok", service: "gateway" }));
    return;
  }
  void yoga(request, response);
});
server.listen(port, "0.0.0.0", () => console.log(`API Gateway listening on ${port}/graphql`));
