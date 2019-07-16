FROM buildpack-deps:bionic-scm

RUN apt-get update
RUN apt-get install -y --no-install-recommends \
	npm \
	nodejs \
	unzip \
	openjdk-8-jdk-headless
	
RUN wget https://services.gradle.org/distributions/gradle-5.2.1-bin.zip -P /tmp
RUN unzip -d /opt/gradle /tmp/gradle-*.zip
ENV GRADLE_HOME /opt/gradle/gradle-5.2.1
ENV PATH ${GRADLE_HOME}/bin:${PATH}

RUN apt-get purge -y openjdk-11*