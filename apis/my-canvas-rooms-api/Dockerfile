FROM node:16-alpine
WORKDIR /usr/src/app
COPY . .
RUN node -v
RUN npm ci --omit=dev

EXPOSE 3000
CMD ["npm", "start"]
