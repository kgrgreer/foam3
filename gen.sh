#!/bin/sh

# This file
# - cleans build folder for all projects under NANOPAY
# - generates the java code for all models
# - move all java code to the root directory build folder

# Remove the build folder if it exist and create a new one
clean_build() {
  if [ -d "$build/" ]; then
    rm -rf build
    mkdir build
  fi
}
clean_build


# Generate java files from models and move to build folder
generate_files() {
  # Copy over directories from src
  for d in *; do
    if [ "$d" = 'target' ] || [ "$d" = 'gen.sh' ]; then
      continue
    fi

    cp -r $d ../build
  done

  # Delete javascript files from ../build/
  find ../build/ -name "*.js" -type f -delete

  # Generate java files to build dir
  cwd=$(pwd)
  node ../../foam2/tools/genjava.js $cwd/../tools/classes.js $cwd/../build $cwd

  # Copy java files to root build folder
  cd ../build/
  find . -name '*.java' | cpio -pdm ../../build/
}

# For each project, generate the java files
for d in *; do
  if [ "$d" = 'admin-portal' ]  || [ "$d" = 'b2b' ]       || [ "$d" = 'foam2' ]   ||
     [ "$d" = 'interac' ]       || [ "$d" = 'merchant' ]  || [ "$d" = 'nanopay' ] ||
     [ "$d" = 'retail' ]; then

    cd $d
    clean_build

    cd src/
    generate_files

    cd ../../
  fi
done
