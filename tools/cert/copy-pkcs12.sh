#!/bin/bash
# Expected to be run as root or with sudo

TEST=0
HOME="$NANOPAY_HOME"

while getopts "t" opt ; do
    case $opt in
      t) TEST=1 ;;
    esac
done

if [[ $TEST -eq 1 ]]; then
  HOME="/tmp/nanopay"
fi

if [ -z "$HOME" ]; then
    HOME="/opt/nanopay"
fi
HOME="$HOME"/var/keys

if [[ -d $HOME && -f $HOME/passphrase ]]; then
    printf "INFO :: Keystore already setup...\n"
    exit 0;
else
    mkdir -p $HOME
fi

# Copy PKCS12
cd "$PROJECT_HOME"
if [[ -f tools/cert/nanopay.key ]]; then
  printf "INFO :: Copying PKCS12 file to PKCS#12 keystore\n"
  cp -f tools/cert/nanopay.p12 "$HOME/keystore.p12"
  cp -f tools/cert/passphrase "$HOME/passphrase"
fi
