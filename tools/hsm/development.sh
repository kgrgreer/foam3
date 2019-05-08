#!/bin/bash
# Setting up SoftHSM for local development
################################################################################

function install_softhsm {
  # Check if softhsm2 is already installed
  if ! type softhsm2-util > /dev/null ; then
    echo "WARNING :: softhsm2 not installed!"
    brew install softhsm
    echo "INFO :: softhsm2 installed."
  else
    echo "INFO :: softhsm2 already installed!"
  fi
}

function create_slots {
  local pin=$1
  # Create fresh slots
  softhsm2-util --init-token --label "development" --so-pin $pin --pin $pin --free
  softhsm2-util --init-token --label "testing" --so-pin $pin --pin $pin --free
  echo "INFO :: New slots for development and testing created..."
}

function migrate_slots {
  # Check if the slots already exist and add them if they don't
  for d in ./hsm/dev/*; do
    if [[ ! -d "/usr/local/var/lib/softhsm/tokens/{$d}" ]]; then
      cp -r ./hsm/dev/d /usr/local/var/lib/softhsm/tokens
    fi
  done
  for d in ./hsm/test/*; do
    if [[ ! -d "/usr/local/var/lib/softhsm/tokens/{$d}" ]]; then
      cp -r ./hsm/test/d /usr/local/var/lib/softhsm/tokens
    fi
  done
}

function clean {
  softhsm2-util --delete-token --token "development"
  softhsm2-util --delete-token --token "testing"
  echo "INFO :: Tokens: development and testing, have been deleted."
}

# while getopts "i:c:" opt ; do
#     case $opt in
#
#         ?) usage ; quit 1 ;;
#     esac
# done

install_softhsm
clean
# create_slots 'Secret.123'
# migrate_slots

softhsm2-util --show-slots
