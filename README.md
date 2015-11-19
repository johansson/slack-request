# slack-request

A system for moderating Slack invites.

## Docker support

To run docker, we recommend creating a standard mongo docker image:

    docker pull mongo

Run it like so:

    docker run --name slack-request-mongo -d mongo

For the application container:

    docker build . --tag=slack-request-app

To run:

    docker run --name slack-request --link slack-request-mongo:mongo -d slack-request-app

A `docker inspect` will give you information about the running container, including the IP address.
