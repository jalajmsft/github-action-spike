# Container image that runs your code
FROM alpine:3.10

# Copies your code file from your action repository to the filesystem path `/` of the container
COPY test.sh /test.sh

# Code file to execute when the docker container starts up (`test.sh`)
ENTRYPOINT ["/test.sh"]