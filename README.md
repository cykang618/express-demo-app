# Express Demo App

This repo is a simple API server written with Express and Typescript.

* Use docker compose to start the api and database service in various modes.
* Use Winston Logger as the logger for application. Also assign a unique ID to
  each http request as well as the subsequent function calls.
* Use request wrappers to catch uncaught exceptions to prevent server crash.
* Use TypeORM to perform database related operations.

## How to Run

#### 1. Requirements
* Latest docker and docker-compose

#### 2. Clone this repo
```
$ git clone https://github.com/cykang/express-demo-app.git 
$ cd express-demo-app
```

#### 3. Development
Automatically starts the MySQL server and the dev server which use `nodemon`
to instantly reflect the changes to your source code. The dev server will
listen at `http://localhost:8000`
```
$ docker-compose -f docker-compose.dev.yml up --force-recreate
```

#### 4. Test and Build
Automatically runs the unit tests and build the docker image. This will also
start a dev server at `http://localhost:8080`
```
$ docker-compose -f docker-compose.test.yml up --force-recreate --build
```

#### 5. Deploy
Build the docker image in production mode
```
$ docker-compose build
```

To start the server in production mode, you need to pass the database credential
through environment variables or a custom `.env` file
```
$ docker-compose --env-file <your-secret.env> up --force-recreate -d
```
The api server will run at `http://localhost:3000`
