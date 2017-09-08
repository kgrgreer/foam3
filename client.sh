#!/bin/sh

# Exit on first failure
set -e

cd ..
find foam2/src NANOPAY/**/src -type f -name countries -exec cat {} \; > countries
find foam2/src NANOPAY/**/src -type f -name countryAgents -exec cat {} \; > countryAgents
find foam2/src NANOPAY/**/src -type f -name crons -exec cat {} \; > crons
find foam2/src NANOPAY/**/src -type f -name exchangerate -exec cat {} \; > exchangerate
find foam2/src NANOPAY/**/src -type f -name exportDriverRegistrys -exec cat {} \; > exportDriverRegistrys
find foam2/src NANOPAY/**/src -type f -name groups -exec cat {} \; > groups
find foam2/src NANOPAY/**/src -type f -name invoiceResolutions -exec cat {} \; > invoiceResolutions
find foam2/src NANOPAY/**/src -type f -name languages -exec cat {} \; > languages
find foam2/src NANOPAY/**/src -type f -name menus -exec cat {} \; > menus
find foam2/src NANOPAY/**/src -type f -name payee -exec cat {} \; > payee
find foam2/src NANOPAY/**/src -type f -name permissions -exec cat {} \; > permissions
find foam2/src NANOPAY/**/src -type f -name regions -exec cat {} \; > regions
find foam2/src NANOPAY/**/src -type f -name script -exec cat {} \; > script
find foam2/src NANOPAY/**/src -type f -name services -exec cat {} \; > services
find foam2/src NANOPAY/**/src -type f -name transactions -exec cat {} \; > transactions
find foam2/src NANOPAY/**/src -type f -name tests -exec cat {} \; > tests
find foam2/src NANOPAY/**/src -type f -name users -exec cat {} \; > users


./NANOPAY/tools/nanos.sh
