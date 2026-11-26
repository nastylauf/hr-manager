# HR Manager

Клиент-серверный MVP для кадрового агентства.

## Локальный запуск через Docker Compose

```powershell
docker compose up --build
```

### Адреса на компьютере

| Что открыть | Адрес |
| --- | --- |
| Сайт | http://localhost:4321 |
| Резюме | http://localhost:4321/resumes |
| Вакансии | http://localhost:4321/vacancies |
| Добавление вакансии | http://localhost:4321/vacancies/new |
| Подбор кандидатов | http://localhost:4321/matching |
| GraphQL (через сайт/Nginx) | http://localhost:4321/graphql |
| GraphQL (напрямую через gateway) | http://localhost:4000/graphql |
| MongoDB Compass | `mongodb://localhost:27017` |
| Jenkins | http://localhost:8080 |

GraphQL через сайт использует тот же origin, что и веб-интерфейс. Порты сервисов резюме, вакансий и сопоставления (`4001`, `4002`, `4003`) доступны только внутри сети Docker Compose и с компьютера напрямую не открываются. Jenkins доступен только на локальном компьютере.

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

После применения манифестов в Kubernetes на Docker Desktop:

| Что открыть | Адрес |
| --- | --- |
| Сайт | http://localhost:30432 |
| Страницы резюме, вакансий и подбора | по тем же путям на порту `30432` |
| GraphQL через сайт/Nginx | http://localhost:30432/graphql |
| GraphQL напрямую через gateway | http://localhost:30040/graphql |

MongoDB и внутренние сервисы в Kubernetes не опубликованы на порты компьютера. Чтобы подключить Compass к MongoDB из Kubernetes, отдельно запустите `kubectl port-forward service/mongo 27017:27017`, затем используйте `mongodb://localhost:27017`.
