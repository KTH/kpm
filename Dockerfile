# This Dockerfile uses multi-stage builds as recommended in
# https://github.com/nodejs/docker-node/blob/master/docs/BestPractices.md
#
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
FROM kthse/kth-nodejs:12.0.0 AS production
RUN apk add --no-cache util-linux
COPY --from=builder node_modules node_modules
COPY . .

EXPOSE 3000

CMD ["./entry"]
