import { spawn } from "node:child_process";

const processes = [
  ["npm", ["run", "dev", "--workspace=@hr-manager/resume-service"]],
  ["npm", ["run", "dev", "--workspace=@hr-manager/vacancy-service"]],
  ["npm", ["run", "dev", "--workspace=@hr-manager/matching-service"]],
  ["npm", ["run", "dev", "--workspace=@hr-manager/gateway"]],
  ["npm", ["run", "dev", "--workspace=@hr-manager/web"]]
];

for (const [command, args] of processes) {
  spawn(command, args, { stdio: "inherit", shell: true });
}
