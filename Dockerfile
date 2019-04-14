FROM node:boron

RUN mkdir /ucoin
ADD package.json /ucoin/
ADD main.js /ucoin/

RUN cd /ucoin && npm install

EXPOSE 3001
EXPOSE 6001

ENTRYPOINT cd /ucoin && npm install && PEERS=$PEERS npm start