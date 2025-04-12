FROM node:22.12.0

RUN mkdir /app
WORKDIR /app

VOLUME /tmp

COPY package*.json ./

RUN npm ci

COPY . .

CMD ["npm", "start"]