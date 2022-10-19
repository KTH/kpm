# This Dockerfile uses multi-stage builds as recommended in
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
#
FROM node:16-bullseye AS frontend
WORKDIR /usr/src/app/kpm-frontend

COPY ["kpm-frontend/package.json", "package.json"]
COPY ["kpm-frontend/package-lock.json", "package-lock.json"]
COPY ["kpm-frontend/evolene-local-packages", "evolene-local-packages"]

# See: https://stackoverflow.com/questions/18136746/npm-install-failed-with-cannot-run-in-wd
RUN npm ci --development
COPY kpm-frontend .
RUN npm run build

FROM node:16-alpine AS backend
WORKDIR /usr/src/app/kpm-backend

COPY ["kpm-backend/package.json", "package.json"]
COPY ["kpm-backend/package-lock.json", "package-lock.json"]
COPY ["kpm-backend/evolene-local-packages", "evolene-local-packages"]

RUN npm ci --omit=dev

FROM node:14-alpine AS production
WORKDIR /usr/src/app
COPY --from=frontend /usr/src/app/kpm-frontend/distProd kpm-frontend/distProd
COPY --from=backend /usr/src/app/kpm-backend/node_modules kpm-backend/node_modules
COPY . .

EXPOSE 3000

CMD cd kpm-backend && npm run start