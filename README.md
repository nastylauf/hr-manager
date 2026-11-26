# HR Manager

Клиент-серверный MVP для кадрового агентства.

## Локальный запуск и просмотр через Docker Compose

Нужен запущенный Docker Desktop с Docker Compose. В PowerShell перейдите в каталог проекта и запустите весь стек:

```powershell
cd D:\hr-manager
docker compose up --build -d
docker compose ps
```

При первом запуске сборка образов может занять несколько минут. В `docker compose ps` дождитесь состояния `Up`; MongoDB и `jenkins-docker` должны стать `healthy`.

### Адреса на компьютере

| Что открыть | Адрес |
| --- | --- |
| Главная страница | http://localhost:4321 |
| Резюме | http://localhost:4321/resumes |
| Вакансии | http://localhost:4321/vacancies |
| Добавление вакансии | http://localhost:4321/vacancies/new |
| Подбор кандидатов | http://localhost:4321/matching |
| GraphQL через Nginx сайта (после пересборки web) | http://localhost:4321/graphql |
| GraphQL напрямую через gateway | http://localhost:4000/graphql |
| Проверка gateway | http://localhost:4000/health |
| MongoDB для Compass или mongosh | `mongodb://localhost:27017` |
| Jenkins | http://localhost:8080 |

Проверка gateway должна вернуть `{"status":"ok","service":"gateway"}`. GraphQL — это API endpoint, а не отдельная GraphiQL-страница: при открытии без GraphQL-запроса сервер вернёт сообщение `Must provide query string.`. Для веб-приложения Nginx проксирует `/graphql` на gateway; если адрес через сайт отвечает `404`, пересоберите web: `docker compose up --build -d web`. Порты сервисов резюме, вакансий и сопоставления (`4001`, `4002`, `4003`) доступны только внутри сети Docker Compose и с компьютера напрямую не открываются. Jenkins привязан к `127.0.0.1` и доступен только на этом компьютере.

### Jenkins

Откройте http://localhost:8080 и войдите под созданной учётной записью. Данные Jenkins, включая настройки и историю сборок, сохраняются в volume `jenkins_home`.

При самой первой настройке Jenkins покажет мастер разблокировки. Начальный пароль можно прочитать командой:

```powershell
docker compose exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

Для создания Pipeline-job (если её ещё нет):

1. Нажмите **New Item**, укажите имя `HR Manager`, выберите **Pipeline**, нажмите **OK**.
2. В разделе **Pipeline** выберите **Pipeline script from SCM** и SCM **Git**.
3. Укажите Repository URL `https://github.com/nastylauf/hr-manager.git`, Branch Specifier `*/main`, Script Path `Jenkinsfile`, затем сохраните настройки.
4. Откройте job **HR Manager**, нажмите **Build with Parameters** и затем **Build**. Для локального запуска оставьте `DEPLOY_TO_KUBERNETES` выключенным.
5. Откройте последний build и выберите **Pipeline Overview** (или **Stages**), чтобы посмотреть результат по этапам.

Репозиторий публичный, поэтому GitHub credentials для checkout не требуются. Docker-сборки выполняются через отдельный Docker-in-Docker сервис внутри Compose-сети; его порт не опубликован на компьютере.

### MongoDB Compass и mongosh

1. Убедитесь, что контейнер `mongo` запущен (`docker compose ps`).
2. В MongoDB Compass нажмите **Add new connection**, укажите `mongodb://localhost:27017` и нажмите **Connect**.
3. Базы и коллекции появляются после того, как приложение сохранит соответствующие данные. Создайте резюме и вакансию через веб-интерфейс; для базы результатов запустите сопоставление.

| База данных | Коллекция |
| --- | --- |
| `hr_resume` | `resumes` |
| `hr_vacancy` | `vacancies` |
| `hr_matching` | `matches` |

Данные MongoDB сохраняются в volume `mongo_data`. Просмотреть их из терминала можно так:

```powershell
docker compose exec mongo mongosh
```

В открывшемся `mongosh` выполните `show dbs`, затем, например, `use hr_resume` и `show collections`.

### Проверка, логи и остановка

```powershell
docker compose ps
docker compose logs -f jenkins
docker compose logs -f gateway
docker compose down
```

`docker compose down` останавливает стек, но сохраняет данные в volumes. Не используйте `docker compose down -v`, если не хотите удалить данные MongoDB и сохранённую конфигурацию Jenkins.

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
