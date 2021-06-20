FROM node:14.16.1

COPY src /opt/app/

WORKDIR /opt/app/

RUN npm install moment

ENTRYPOINT  ["node", "/opt/app/auditor.js"]