# This Dockerfile uses multi-stage builds as recommended in
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
#
# First "stage" is a development image, used to install dependencies and
# build things like frontend code
FROM kthse/kth-nodejs:12.0.0 AS development
WORKDIR /usr/src/app

# Copying package*.json files first allows us to use the cached dependencies if
# they haven't changed
COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]

RUN apk add --no-cache python make g++

# See: https://stackoverflow.com/questions/18136746/npm-install-failed-with-cannot-run-in-wd
RUN npm ci --unsafe-perm
RUN npm run build



# Second "stage" is a builder image, used to install production dependencies
FROM kthse/kth-nodejs:12.0.0 AS builder
COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]

RUN apk add --no-cache python make g++
RUN npm ci --production --unsafe-perm



# Third "stage" is the production image, where we don't install dependencies
# but use the already installed ones.
#
# This way we can deliver an image without the toolchain (python, make, etc)
FROM kthse/kth-nodejs AS production
COPY --from=builder node_modules .
COPY --from=development dist .

EXPOSE 3000

CMD ["node", "app.js"]
