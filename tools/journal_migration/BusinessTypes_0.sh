#!/usr/bin/perl -w

# Clear businessTypes so we can have new list from businessTypes.0

#use strict;
use File::Copy 'move';
my $TMP = "/opt/nanopay/journals/businessTypes.tmp";
my $BUSINESS_TYPES = "/opt/nanopay/journals/businessTypes";


open(FILE, ">$TMP") || die "File not found";
close(FILE);

move $TMP, $BUSINESS_TYPES || die "move $TMP, $BUSINESS_TYPES failed: $!";
