#!/bin/bash
#
# Starts {App} inside the Vercel container.
#
# Mirrors what `./build.sh` does before it launches the JVM
# (foam3/tools/JavaTooling.js, startCORE): copy the built journals and
# documents into a writable application home, then start foam.core.boot.Boot
# from the compiled classes. On Vercel only /tmp is writable, so runtime
# journals start from the seed data on every cold start.
set -e

APP_HOME=/tmp/{app}

mkdir -p "${APP_HOME}/journals" "${APP_HOME}/documents" "${APP_HOME}/logs"
cp -r build/journals/. "${APP_HOME}/journals/"
if [ -d build/documents ]; then
  cp -r build/documents/. "${APP_HOME}/documents/"
fi

# MaxRAMPercentage sizes the heap from the container limit (2 GB on the
# Vercel Hobby plan) instead of the 4 GB the deploy scripts assume.
export JAVA_TOOL_OPTIONS="${JAVA_TOOL_OPTIONS} \
 -XX:MaxRAMPercentage=60 \
 -DJOURNAL_HOME=${APP_HOME}/journals \
 -DDOCUMENT_HOME=${APP_HOME}/documents \
 -Dhttp.port=${PORT:-80} \
 -Dapp.name={app} \
 -Dhostname=$(hostname) \
 -Dcore.webroot=/app \
 -Duser.timezone=GMT"

exec java -cp "build/classes:build/lib/*" foam.core.boot.Boot "boot.script:main"
