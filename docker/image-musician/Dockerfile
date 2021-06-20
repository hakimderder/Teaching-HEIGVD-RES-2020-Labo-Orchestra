FROM node:14.16.1

COPY src/ /opt/app/

WORKDIR opt/app/

RUN npm install uuid

ENTRYPOINT ["node", "/opt/app/musician.js"]