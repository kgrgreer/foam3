#!/bin/sh

rm -r ../build/
mkdir ../build/

for d in *; do
  if [ "$d" = 'target/' ]; then
    continue
  fi
  if [ "$d" = 'gen.sh' ]; then
    continue
  fi
  cp -r $d ../build
done

find ../build/ -name "*.js" -type f -delete

cwd=$(pwd)
node ../../../foam3/tools/genjava.js $cwd/../classes.js $cwd/../build $cwd
