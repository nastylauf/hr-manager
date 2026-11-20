# HR Manager

Клиент-серверный MVP для кадрового агентства.

## Локальный запуск через Docker Compose

```powershell
docker compose up --build
```

- Клиент: http://localhost:4321
- GraphQL: http://localhost:4000/graphql

Данные MongoDB сохраняются в volume `mongo_data`.

## Локальная разработка

Один MongoDB должен быть доступен по адресу из `.env.example`, либо запустите только MongoDB:

```powershell
docker compose up -d mongo
npm install
npm run dev
```

## Kubernetes

При включённом Kubernetes в Docker Desktop соберите образы и примените манифесты:

```powershell
docker build -f docker/resume.Dockerfile -t hr-manager/resume-service:latest .
docker build -f docker/vacancy.Dockerfile -t hr-manager/vacancy-service:latest .
docker build -f docker/matching.Dockerfile -t hr-manager/matching-service:latest .
docker build -f docker/gateway.Dockerfile -t hr-manager/gateway:latest .
docker build -f docker/web.Dockerfile -t hr-manager/web:latest .
kubectl apply -f k8s/configmap.yaml
kubectl apply -f k8s/secret.yaml
kubectl apply -f k8s/mongo.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/gateway-web.yaml
```

Клиент будет доступен через NodePort `30432`, GraphQL — через `30040`.
