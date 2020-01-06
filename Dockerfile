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
ENV REFRESHED_AT 2020-01-01

# Software Version.
ENV NODE_VERSION 12
ENV JAVA_VERSION 8
ENV GRADLE_VERSION 5.2.1

ENV APP_DIR /opt/app

# Update software.
RUN apt-get -yqq update

# Install curl and wget.
RUN apt-get install -yqq curl
RUN apt-get install -yqq wget

# Install zip and unzip.
RUN apt-get install -yqq zip
RUN apt-get install -yqq unzip

# Install vim.
RUN apt-get install -yqq vim

# Install zsh and ohmyzsh.
RUN apt-get -yqq install zsh
# RUN chsh -s /bin/zsh root
RUN wget https://github.com/robbyrussell/oh-my-zsh/raw/master/tools/install.sh -O - | zsh || true

# Install git.
RUN apt-get install -yqq git

# Install nodejs.
RUN curl -sL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
RUN apt-get install -yqq nodejs

# Install java.
RUN apt-get install -yqq openjdk-${JAVA_VERSION}-jdk

# Install maven.
RUN apt-get install -yqq maven

# Install gradle.
RUN wget https://services.gradle.org/distributions/gradle-${GRADLE_VERSION}-bin.zip -P /tmp
RUN unzip -d /lib/gradle /tmp/gradle-*.zip
ENV GRADLE_HOME /lib/gradle/gradle-${GRADLE_VERSION}
ENV PATH ${GRADLE_HOME}/bin:${PATH}

ENV NANOPAY_ROOT="/tmp/nanopay_root"
# VOLUME ["/opt/nanopay_root"]
VOLUME ["/tmp/nanopay_root"]
VOLUME ["/tmp/app"]
# COPY . /opt/app
WORKDIR /tmp/app

ENTRYPOINT ["./build.sh"]
# CMD["ic"]
EXPOSE 80

# Useful docker commands.
# docker build -t="nanopay" . -> doceker build -t="${image_name}" .
# docker run --name nanopay -it nanopay -> docker run --name ${contain_name} -it ${image_name}
# docker run --name nanopay -p 127.0.0.1:80:80
# docker rm ${contain_name}
# -v ${mechine_folder}:${container_foler}:${status: ro | rw}
# docker run -v ${PWD}:/opt/app:rw --name nanopay -it nanopay
# docker run -v ${PWD}:/tmp/app:rw -v /tmp/nanopay_root:/tmp/nanopay_root:rw --name nanopay -it nanopay -c -uJdevelopment -Nmm1 -C1 -W8001 -Amn
