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

function create_slot {
  # Create fresh slot
  if [[ $DEVELOPMENT_SLOT -eq 0 ]]; then
    softhsm2-util --init-token --label "development" --so-pin $PIN --pin $PIN --free
  fi

  printf "INFO :: New slot for development created...\n"
}

function migrate_slot {
  # Check if the slots already exist and add them if they don't
  for d in $ROOT/dev/*/; do
    SLOT_DIR=`basename "$d"`
    if [[ ! -d "/usr/local/var/lib/softhsm/tokens/${SLOT_DIR}" ]]; then
      cp -r ${d} /usr/local/var/lib/softhsm/tokens
    fi
  done

  printf "INFO :: Token for development has been updated locally.\n"
}

function clean {
  softhsm2-util --show-slots | grep -q 'development'
  DEVELOPMENT_SLOT=$?
  if [[ $DEVELOPMENT_SLOT -eq 0 ]]; then
    softhsm2-util --delete-token --token "development"
  fi

  # Testing token is made by the pkcs11_keystoremanager_test test
  softhsm2-util --show-slots | grep -q 'SecurityTestUtil'
  TESTING_SLOT=$?
  if [[ $TESTING_SLOT -eq 0 ]]; then
    softhsm2-util --delete-token --token "SecurityTestUtil"
  fi

  printf "INFO :: Tokens for development and testing have been deleted.\n"
}

function config_setup {
  cp $ROOT/dev/pkcs11.cfg $CONFIG_PATH

  printf "INFO :: SoftHSM config file setup...\n"
}

function backup {
  cp -r /usr/local/var/lib/softhsm/tokens $ROOT/dev/2c994c25-5565-55f2-0f4f-9458ac0f1537

  printf "INFO :: Token for development has been backed up to the repo successfully.\n"
}

CREATE=0
CONFIG_PATH="/opt/nanopay/keys"
PIN="Secret.123"
ROOT="."

while getopts "bcp:r:d:" opt ; do
    case $opt in
        b) backup ; exit 0 ;;
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
  create_slot
else
  migrate_slot
fi

config_setup

printf "INFO :: SoftHSM successfully setup.\n"
softhsm2-util --show-slots
exit 0
