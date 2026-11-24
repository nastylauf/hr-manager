FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY packages ./packages
COPY services/vacancy-service ./services/vacancy-service
RUN npm install
RUN npm run build --workspace=@hr-manager/shared
RUN npm run build --workspace=@hr-manager/vacancy-service

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/services/vacancy-service/dist ./dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/services/vacancy-service/package.json ./package.json
ENV PORT=4002
EXPOSE 4002
CMD ["node", "dist/server.js"]
