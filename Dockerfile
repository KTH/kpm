FROM kthse/kth-nodejs:12.0.0
WORKDIR /usr/src/app

# We do this to avoid npm install when we're only changing code
COPY ["package.json", "package.json"]
COPY ["package-lock.json", "package-lock.json"]

# Docker runs commands as "root". Wihout the `--unsafe-perm` flag, the
# preinstall and postinstall scripts will be run as `nobody` resulting in
# errors
#
# See: https://stackoverflow.com/questions/18136746/npm-install-failed-with-cannot-run-in-wd
RUN npm ci --production --unsafe-perm

# Everything else
COPY . .

EXPOSE 3000

CMD ["node", "app.js"]
