#!/bin/bash
# Expected to be run as root or with sudo

TEST=0
HOME="$NANOPAY_HOME"
MACOS='darwin*'
LINUXOS='linux-gnu'
IS_MAC=0
IS_LINUX=0

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
HOME="$HOME"/keys

if [[ -d $HOME && -f $HOME/passphrase ]]; then
    printf "INFO :: Keystore already setup...\n"

    # convert jceks to pkcs12
    if [[ -f $HOME/keystore.jks && ! -f $HOME/keystore.p12 ]]; then
      printf "INFO :: Converting JCEKS keystore to PKCS#12 keystore\n"
      keytool -importkeystore \
              -srckeystore $HOME/keystore.jks \
              -destkeystore $HOME/keystore.p12 \
              -srcstorepass `cat $HOME/passphrase` \
              -deststorepass `cat $HOME/passphrase` \
              -srcstoretype jceks \
              -deststoretype pkcs12
    fi

    exit 0;
else
    mkdir -p $HOME
fi

#determine OS environment
if [[ $OSTYPE =~ $MACOS ]]; then
    IS_MAC=1
elif [[ $OSTYPE =~ $LINUXOS ]]; then
    IS_LINUX=1
fi

#create passphrase
if [[ $IS_MAC -eq 1 ]]; then
    echo "INFO :: Creating passphrase using python on MACOS"
    python -c 'print open("/dev/random").read(24).encode("base64").strip("=\n")' > "$HOME/passphrase"
elif [[ $IS_LINUX -eq 1 ]]; then
    echo "INFO :: Creating passphrase using python on LINUX"
    dd if=/dev/random bs=24 count=1 | base64 | tr -d '\n' > $HOME/passphrase
fi

# creates a keystore with a dummy entry
keytool \
    -noprompt \
    -genkey \
    -alias dummy \
    -dname "CN=*.nanopay.net, O=nanopay Corporation, L=Toronto, ST=Ontario, C=CA" \
    -keyalg RSA \
    -keysize 2048 \
    -keystore $HOME/keystore.p12 \
    -storetype pkcs12 \
    -storepass `cat $HOME/passphrase` \
    -keypass `cat $HOME/passphrase`

# deletes the dummy entry
keytool \
    -delete \
    -alias dummy \
    -keystore $HOME/keystore.p12 \
    -storetype pkcs12 \
    -storepass `cat $HOME/passphrase`
