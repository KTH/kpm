FROM node:16-alpine
WORKDIR /usr/src/app
COPY . .
RUN node -v
# RUN cd commonPackages/kpm-api-common && npm ci --omit=dev
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
