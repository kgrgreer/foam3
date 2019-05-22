#!/bin/bash
# Setting up SoftHSM for local development
################################################################################

function install_softhsm {
  # Check if softhsm2 is already installed
  if ! type softhsm2-util > /dev/null ; then
    printf "WARNING :: softhsm2 not installed!\n"
    brew install softhsm
    printf "INFO :: softhsm2 installed.\n"
  else
    printf "INFO :: softhsm2 already installed!\n"
  fi
}

function create_slots {
  # Create fresh slots
  if [[ $DEVELOPMENT_SLOT -eq 0 ]]; then
    softhsm2-util --init-token --label "development" --so-pin $PIN --pin $PIN --free
  fi

  if [[ $TESTING_SLOT -eq 0 ]]; then
    softhsm2-util --init-token --label "testing" --so-pin $PIN --pin $PIN --free
  fi

  printf "INFO :: New slots for development and testing created...\n"
}

function migrate_slots {
  # Check if the slots already exist and add them if they don't
  for d in ./hsm/dev/*; do
    if [[ ! -d "/usr/local/var/lib/softhsm/tokens/{$d}" ]]; then
      cp -r $ROOT/dev/0c67db3b-39d0-6d8a-f146-a683a1f0988b /usr/local/var/lib/softhsm/tokens
    fi
  done
  for d in ./hsm/test/*; do
    if [[ ! -d "/usr/local/var/lib/softhsm/tokens/{$d}" ]]; then
      cp -r $ROOT/test/2c994c25-5565-55f2-0f4f-9458ac0f1537 /usr/local/var/lib/softhsm/tokens
    fi
  done

  printf "INFO :: Tokens: development and testing, have been updated locally.\n"
}

function clean {
  softhsm2-util --show-slots | grep -q 'development'
  DEVELOPMENT_SLOT=$?
  if [[ $DEVELOPMENT_SLOT -eq 0 ]]; then
    softhsm2-util --delete-token --token "development"
  fi

  softhsm2-util --show-slots | grep -q "testing"
  TESTING_SLOT=$?
  if [[ $TESTING_SLOT -eq 0 ]]; then
    softhsm2-util --delete-token --token "testing"
  fi

  printf "INFO :: Tokens: development and testing, have been deleted.\n"
}

function config_setup {
  cp $ROOT/dev/softhsm.cfg $CONFIG_PATH

  printf "INFO :: SoftHSM config file setup...\n"
}

CREATE=0
CONFIG_PATH="/opt/nanopay/keys/pkcs11.cfg"
PIN="Secret.123"
ROOT="."

while getopts "cp:r:d" opt ; do
    case $opt in
        c) CREATE=1 ;;
        d) CONFIG_PATH=$OPTARG ;;
        p) PIN=$OPTARG ;;
        r) ROOT=$OPTARG ;;
        ?) usage ; exit 1 ;;
    esac
done

install_softhsm
clean

if [[ $CREATE -eq 1 ]]; then
  create_slots
else
  migrate_slots
fi

config_setup

printf "INFO :: SoftHSM successfully setup.\n"
softhsm2-util --show-slots
exit 0
