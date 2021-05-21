#!/usr/bin/env bash

# Generates your own Certificate Authority for development.
# This script should be executed just once.

DOMAIN=nanopay-ca

set -e

if [ -f "$DOMAIN.crt" ] || [ -f "$DOMAIN.key" ]; then
    echo -e "Certificate Authority files already exist!"
    echo
    echo -e "You only need a single CA even if you need to create multiple certificates."
    echo -e "This way, you only ever have to import the certificate in your browser once."
    echo
    echo -e "If you want to restart from scratch, delete the ca.crt and ca.key files."
    exit
fi

# Set our CSR variables
SUBJ="
C=CA
ST=Ontario
localityName=Toronto
O=nanopay.net
organizationalUnitName=R&D
emailAddress=support@nanopay.net
"

# Generate private key
openssl genrsa -out "$DOMAIN.key" 2048

# Generate root certificate
openssl req -x509 -new -nodes -subj "$(echo -n "$SUBJ" | tr "\n" "/")" -key "$DOMAIN.key" -sha256 -days 712 -out "$DOMAIN.crt"

echo -e "Success!"
echo
echo "The following files have been written:"
echo -e "  - $DOMAIN.crt is the public certificate that should be imported in your browser"
echo -e "  - $DOMAIN.key is the private key that will be used by create-certificate.sh"
echo
echo "Next steps:"
echo -e "  - Import $DOMAIN.crt in your browser"
echo -e "  MacOS:"
echo -e "  Certificate Authority must be installed."
echo -e "  1. double click nanopay-ca.csr"
echo -e "  2. add to MacOS keychain"
echo -e "  3. open the newly added 'R&D' entry"
echo -e "  4. open the 'Trust' section, near the top"
echo -e "  5. change 'When using this certificate' to 'Always Trust'"
echo -e "  6. close window, you will be prompted to make system changes"
echo -e " "
echo -e "  - run create-wildcard-certificate.sh"
