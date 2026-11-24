pipeline {
  agent any
  environment {
    COMPOSE_PROJECT_NAME = 'hr-manager'
  }
  stages {
    stage('Получение исходников') {
      steps { checkout scm }
    }
    stage('Установка зависимостей') {
      steps { sh 'npm install' }
    }
    stage('Проверка TypeScript') {
      steps { sh 'npm run typecheck' }
    }
    stage('Тесты') {
      steps { sh 'npm test' }
    }
    stage('Сборка Docker-образов') {
      steps {
        sh 'docker build -f docker/resume.Dockerfile -t hr-manager/resume-service:latest .'
        sh 'docker build -f docker/vacancy.Dockerfile -t hr-manager/vacancy-service:latest .'
        sh 'docker build -f docker/matching.Dockerfile -t hr-manager/matching-service:latest .'
        sh 'docker build -f docker/gateway.Dockerfile -t hr-manager/gateway:latest .'
        sh 'docker build -f docker/web.Dockerfile -t hr-manager/web:latest .'
      }
    }
    stage('Развёртывание в Kubernetes') {
      when { expression { return params.DEPLOY_TO_KUBERNETES } }
      steps {
        sh 'kubectl apply -f k8s/configmap.yaml'
        sh 'kubectl apply -f k8s/secret.yaml'
        sh 'kubectl apply -f k8s/mongo.yaml'
        sh 'kubectl apply -f k8s/services.yaml'
        sh 'kubectl apply -f k8s/gateway-web.yaml'
      }
    }
  }
  parameters {
    booleanParam(name: 'DEPLOY_TO_KUBERNETES', defaultValue: false, description: 'Применять манифесты к локальному Kubernetes')
  }
  post {
    always { echo 'Проверка Jenkins pipeline завершена.' }
  }
}
