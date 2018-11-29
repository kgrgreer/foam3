FROM buildpack-deps:bionic-scm

RUN apt-get update
RUN apt-get install -y --no-install-recommends \
	maven \
	npm \
	nodejs \
	openjdk-8-jdk-headless
RUN apt-get purge -y openjdk-11*