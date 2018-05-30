#!/bin/bash
# Expected to be run as root or with sudo

HOME="$NANOPAY_HOME"
if [ -z "$HOME" ]; then
    HOME="/opt/nanopay"
fi
HOME="$HOME"/keys

if [ -f "$HOME/passphrase" ]; then
    printf "keystore already setup.\n"
    exit 0;
fi

mkdir -p $HOME

python -c 'print open("/dev/random").read(24).encode("base64").strip("=\n")' > "$HOME/passphrase"

# creates a keystore with a dummy entry
keytool \
    -noprompt \
    -genkey \
    -alias dummy \
    -dname "CN=*.nanopay.net, O=nanopay Corporation, L=Toronto, ST=Ontario, C=CA" \
    -keyalg RSA \
    -keysize 2048 \
    -keystore $HOME/keystore.jks \
    -storetype JCEKS \
    -storepass `cat $HOME/passphrase` \
    -keypass `cat $HOME/passphrase`

# deletes the dummy entry
keytool \
    -delete \
    -alias dummy \
    -keystore $HOME/keystore.jks \
    -storetype JCEKS \
    -storepass `cat $HOME/passphrase`
