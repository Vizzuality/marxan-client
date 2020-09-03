FROM node:12.13.0-alpine
LABEL maintainer="hello@vizzuality.com"

RUN apk add --update \
    bash \
    && rm -rf /var/cache/apk/*

WORKDIR /opt/$NAME
ADD package.json yarn.lock ./
RUN cd /opt/$NAME && yarn install --frozen-lockfile

COPY . .

RUN yarn build

EXPOSE 3000

ENTRYPOINT ["sh", "./entrypoint.sh"]
