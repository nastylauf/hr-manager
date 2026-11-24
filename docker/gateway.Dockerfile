FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
COPY tsconfig.base.json ./
COPY gateway ./gateway
COPY packages ./packages
RUN npm install
RUN npm run build --workspace=@hr-manager/shared
RUN npm run build --workspace=@hr-manager/gateway

FROM node:20-alpine
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/gateway/dist ./dist
COPY --from=build /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=build /app/gateway/package.json ./package.json
ENV PORT=4000
EXPOSE 4000
CMD ["node", "dist/server.js"]
