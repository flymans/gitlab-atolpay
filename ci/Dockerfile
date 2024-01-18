FROM harbor-croc-test.atolpay.ru/dockerhub-proxy/library/node:20-alpine AS builder

WORKDIR /app
COPY ./package.json ./yarn.lock ./

RUN yarn install

COPY . .

RUN yarn run build

FROM builder

WORKDIR /app
COPY --from=builder /app/dist /app

CMD yarn start:prod
