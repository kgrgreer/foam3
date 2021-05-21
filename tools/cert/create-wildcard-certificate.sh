#!/usr/bin/env bash

# Generates a wildcard certificate for a domain for development.

set -e

DOMAIN=nanopay
PASSWORD=$DOMAIN

if [ ! -f "$DOMAIN-ca.key" ]; then
    echo -e "Certificate Authority private key does not exist!"
    echo
    echo -e "Please run create-ca.sh first."
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

# Generate a private key
openssl genrsa -out "$DOMAIN.key" 2048

# Create a certificate signing request
openssl req -new -subj "$(echo -n "$SUBJ" | tr "\n" "/")" -key "$DOMAIN.key" -out "$DOMAIN.csr"

# Create a config file for the extensions
>"$DOMAIN.ext" cat <<-EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth, clientAuth
subjectAltName = @alt_names
[alt_names]
DNS.1 = localhost
DNS.2 = localhost.localdomain
DNS.3 = *.nanopay.net
DNS.4 = *.backoffice.nanopay.net
DNS.5 = *.development.nanopay.net
DNS.6 = *.development.medusa.nanopay.net
DNS.7 = *.backoffice.development.nanopay.net
DNS.8 = *.backoffice.development.medusa.nanopay.net
DNS.9 = *.release.nanopay.net
DNS.10 = *.release.medusa.nanopay.net
DNS.11 = *.backoffice.release.nanopay.net
DNS.12 = *.backoffice.release.medusa.nanopay.net
DNS.13 = *.staging.nanopay.net
DNS.14 = ablii
DNS.15 = app.ablii.com
DNS.16 = bpp
DNS.17 = intuit
DNS.18 = treviso
DNS.19 = moosehead
IP.1 = 127.0.0.1
IP.2 = ::1
EOF

# Create the signed certificate
openssl x509 -req \
    -in "$DOMAIN.csr" \
    -extfile "$DOMAIN.ext" \
    -CA "$DOMAIN-ca.crt" \
    -CAkey "$DOMAIN-ca.key" \
    -CAcreateserial \
    -out "$DOMAIN.crt" \
    -days 712 \
    -sha256

rm "$DOMAIN.csr"
rm "$DOMAIN.ext"

# Create pkcs and key store
openssl pkcs12 \
        -inkey "$DOMAIN.key" \
        -in "$DOMAIN.crt" \
        -export -out "$DOMAIN.pkcs12" \
        -passout pass:"$PASSWORD"

echo "keytool"
keytool \
    -importkeystore \
    -srckeystore "$DOMAIN.pkcs12" \
    -srcstoretype PKCS12 \
    -srcstorepass "$PASSWORD" \
    -destkeystore "$DOMAIN.jks" \
    -deststorepass "$PASSWORD"

keytool -list -v \
        -keystore "$DOMAIN.jks" \
        -storepass "$PASSWORD"

echo -e "Success!"
echo
echo -e "You can now use $DOMAIN.key and $DOMAIN.crt in your web server."
echo -e "And use $DOMAIN.jks as a keystore."
echo -e "Don't forget that you must have imported ca.crt in your browser to make it accept the certificate."
