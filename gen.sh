#!/bin/sh

# This file
# - cleans build folder for all projects under NANOPAY
# - generates the java code for all models
# - move all java code to the root directory build folder

# Remove the build folder if it exist and create a new one
clean() {
  if [ -d "$build/" ]; then
    rm -rf build
    mkdir build
  fi
}

# Clean top level build folder
clean

# Generate java files from models and move to build folder
generate_java() {
  # Copy over directories from project/src to project/build
  for d in *; do
    if [ "$d" = 'target' ] || [ "$d" = 'gen.sh' ]; then
      continue
    fi

    cp -r $d ../build
  done

  # Delete javascript files from ../build/
  find ../build/ -name "*.js" -type f -delete

  # Generate java files to project/build
  cwd=$(pwd)
  node ../../foam2/tools/genjava.js $cwd/../tools/classes.js $cwd/../build $cwd

  # Copy java files from project/build to NANOPAY/build
  cd ../build/
  find . -name '*.java' | cpio -pdm ../../build/
}

# For each project, generate the java files
for d in *; do
  if [ "$d" = 'admin-portal' ]  || [ "$d" = 'b2b' ]       || [ "$d" = 'foam2' ]   ||
     [ "$d" = 'interac' ]       || [ "$d" = 'merchant' ]  || [ "$d" = 'nanopay' ] ||
     [ "$d" = 'retail' ]; then

    cd $d
    clean

    cd src/
    generate_java

    cd ../../
  fi
done
