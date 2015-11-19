FROM ubuntu
MAINTAINER James Tranovich <jtranovich@gmail.com>

RUN apt-get update
RUN apt-get -y install nodejs npm git libkrb5-dev
RUN git clone https://github.com/johansson/slack-request
# Because Debian uses `nodejs` instead
RUN update-alternatives --install /usr/bin/node nodejs /usr/bin/nodejs 100
WORKDIR slack-request
RUN npm install

CMD ["npm", "start"]

EXPOSE 3000
