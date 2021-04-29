#!/bin/sh

# Delete old build files
rm -r ../build/
mkdir ../build/

# Copy over directories from src
for d in * ; do
    if [ "$d" = 'target/' ]; then
        continue
    fi
    if [ "$d" = 'gen.sh' ]; then
        continue
    fi
    cp -r $d ../build
done

# Delete javascript files from ../build/
find ../build/ -name "*.js" -type f -delete

# Generate java files to build dir
cwd=$(pwd)
node ../../foam3/tools/genjava.js $cwd/../tools/classes.js $cwd/../build $cwd
node ../../tools/build.js web
