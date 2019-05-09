#!/bin/bash
# Setting up SoftHSM for local development
################################################################################

# Exit on first failure
set -e

function quit {
  # Unset error on exit
  set +e
  exit $1
}

function install_softhsm {
  # Check if softhsm2 is already installed
  if ! type softhsm2-util > /dev/null ; then
    printf "WARNING :: softhsm2 not installed!\n\n"
    brew install softhsm
    printf "INFO :: softhsm2 installed.\n\n"
  else
    printf "INFO :: softhsm2 already installed!\n\n"
  fi
}

function create_slots {
  # Create fresh slots
  softhsm2-util --init-token --label "development" --so-pin $PIN --pin $PIN --free
  softhsm2-util --init-token --label "testing" --so-pin $PIN --pin $PIN --free
  printf "INFO :: New slots for development and testing created...\n\n"
}

function migrate_slots {
  # Check if the slots already exist and add them if they don't
  for d in ./hsm/dev/*; do
    if [[ ! -d "/usr/local/var/lib/softhsm/tokens/{$d}" ]]; then
      cp -r dev/0c67db3b-39d0-6d8a-f146-a683a1f0988b /usr/local/var/lib/softhsm/tokens
    fi
  done
  for d in ./hsm/test/*; do
    if [[ ! -d "/usr/local/var/lib/softhsm/tokens/{$d}" ]]; then
      cp -r test/2c994c25-5565-55f2-0f4f-9458ac0f1537 /usr/local/var/lib/softhsm/tokens
    fi
  done

  printf "INFO :: Tokens: development and testing, have been updated locally.\n\n"
}

function clean {
  softhsm2-util --delete-token --token "development"
  softhsm2-util --delete-token --token "testing"
  printf "INFO :: Tokens: development and testing, have been deleted.\n\n"
}

CREATE=0
PIN="Secret.123"

while getopts "cp:" opt ; do
    case $opt in
        c) CREATE=1 ;;
        p) PIN=$OPTARG ;;
        ?) usage ; quit 1 ;;
    esac
done

install_softhsm
clean

if [[ $CREATE -eq 1 ]]; then
  create_slots
else
  migrate_slots
fi

printf "INFO :: SoftHSM successfully setup.\n\n"
softhsm2-util --show-slots
quit 0
