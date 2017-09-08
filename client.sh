#!/bin/sh

# Exit on first failure
set -e

cd ..
find foam2/src NANOPAY/**/src -type f -name accounts -exec cat {} \; > accounts
find foam2/src NANOPAY/**/src -type f -name banks -exec cat {} \; > banks
find foam2/src NANOPAY/**/src -type f -name bankAccounts -exec cat {} \; > bankAccounts
find foam2/src NANOPAY/**/src -type f -name countries -exec cat {} \; > countries
find foam2/src NANOPAY/**/src -type f -name crons -exec cat {} \; > crons
find foam2/src NANOPAY/**/src -type f -name exchangerate -exec cat {} \; > exchangerate
find foam2/src NANOPAY/**/src -type f -name exportDriverRegistrys -exec cat {} \; > exportDriverRegistrys
find foam2/src NANOPAY/**/src -type f -name groups -exec cat {} \; > groups
find foam2/src NANOPAY/**/src -type f -name languages -exec cat {} \; > languages
find foam2/src NANOPAY/**/src -type f -name menus -exec cat {} \; > menus
find foam2/src NANOPAY/**/src -type f -name permissions -exec cat {} \; > permissions
find foam2/src NANOPAY/**/src -type f -name regions -exec cat {} \; > regions
find foam2/src NANOPAY/**/src -type f -name script -exec cat {} \; > script
find foam2/src NANOPAY/**/src -type f -name services -exec cat {} \; > services
find foam2/src NANOPAY/**/src -type f -name tests -exec cat {} \; > tests
find foam2/src NANOPAY/**/src -type f -name transactions -exec cat {} \; > transactions
find foam2/src NANOPAY/**/src -type f -name users -exec cat {} \; > users
find foam2/src NANOPAY/**/src -type f -name payees -exec cat {} \; > payees


./NANOPAY/tools/nanos.sh
