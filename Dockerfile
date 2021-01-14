FROM buildpack-deps:bionic-scm

RUN apt-get update
RUN apt-get install -y --no-install-recommends curl
RUN apt-get install -y --no-install-recommends unzip
RUN apt-get install -y --no-install-recommends npm
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
RUN apt-get install -y --no-install-recommends nodejs
RUN node -v
RUN npm -v

RUN apt-get purge -y openjdk-11*

ENV JAVA_VERSION jdk-11.0.5+10_openj9-0.17.0

RUN set -eux; \
    ESUM='6ead0515aecb24c6a8f5f3800a070b7d20a66c8f26cba5dad137824da590a532'; \
    BINARY_URL='https://github.com/AdoptOpenJDK/openjdk11-binaries/releases/download/jdk-11.0.5%2B10_openj9-0.17.0/OpenJDK11U-jdk_x64_linux_openj9_11.0.5_10_openj9-0.17.0.tar.gz'; \
    curl --insecure -LfsSo /tmp/openjdk.tar.gz ${BINARY_URL}; \
    echo "${ESUM} */tmp/openjdk.tar.gz" | sha256sum -c -; \
    mkdir -p /opt/java/openjdk; \
    cd /opt/java/openjdk; \
    tar -xf /tmp/openjdk.tar.gz --strip-components=1; \
    rm -rf /tmp/openjdk.tar.gz;

ENV JAVA_HOME=/opt/java/openjdk \
    PATH="/opt/java/openjdk/bin:$PATH"
	
RUN wget https://downloads.gradle-dn.com/distributions/gradle-5.4.1-bin.zip --no-check-certificate -P /tmp
RUN unzip -d /opt/gradle /tmp/gradle-*.zip
ENV GRADLE_HOME /opt/gradle/gradle-5.2.1
ENV PATH ${GRADLE_HOME}/bin:${PATH}

