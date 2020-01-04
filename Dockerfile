# FROM buildpack-deps:bionic-scm

# RUN apt-get update
# RUN apt-get install -y --no-install-recommends \
# 	npm \
# 	nodejs \
# 	unzip \
# 	openjdk-8-jdk-headless

# RUN wget https://services.gradle.org/distributions/gradle-5.2.1-bin.zip -P /tmp
# RUN unzip -d /opt/gradle /tmp/gradle-*.zip
# ENV GRADLE_HOME /opt/gradle/gradle-5.2.1
# ENV PATH ${GRADLE_HOME}/bin:${PATH}

# RUN apt-get purge -y openjdk-11*

FROM ubuntu:18.04
MAINTAINER Xuerong Wu "xuerong@nanopay.net"
USER root
ENV REFRESHED_AT 2014-07-01

# Software Version.
ENV NODE_VERSION 12
ENV JAVA_VERSION 8
ENV GRADLE_VERSION 5.2.1

ENV APP_DIR /opt/app

# Update software.
RUN apt-get update

# Install curl and wget.
RUN apt-get install -y curl
RUN apt-get install -y wget

# Install zip and unzip.
RUN apt-get install -y zip
RUN apt-get install -y unzip

# Install vim.
RUN apt-get install -y vim

# Install zsh and ohmyzsh.
RUN apt-get -y install zsh
# RUN chsh -s /bin/zsh root
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

# Install git.
RUN apt-get install -y git

# Install nodejs.
RUN curl -sL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
RUN apt-get install -y nodejs

# Install java.
RUN apt-get install -y openjdk-${JAVA_VERSION}-jdk

# Install maven.
RUN apt-get install -y maven

# Install gradle.
RUN wget https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip -P /tmp
RUN unzip -d /opt/gradle /tmp/gradle-*.zip
ENV GRADLE_HOME /opt/gradle/gradle-${GRADLE_VERSION}
ENV PATH ${GRADLE_HOME}/bin:${PATH}

COPY . /opt/app
WORKDIR /opt/app

# ENTRYPOINT ["./build.sh"]
# RUN apt-get install -y nginx
# RUN echo 'Hi, I am in your container' \
# 	>/usr/share/nginx/html/index.html
# CMD ["zsh"]
# ENTRYPOINT [""]
EXPOSE 80
