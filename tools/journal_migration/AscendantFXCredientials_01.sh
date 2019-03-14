#!/usr/bin/perl -w

# Convert "host:" to "url:"

#use strict;
use File::Copy 'move';
my $TMP = "/opt/nanopay/journals/services.tmp";
my $SERVICES = "/opt/nanopay/journals/services";

open(FILE, "<$SERVICES") || die "File not found: $SERVICES";
my @lines = <FILE>;
close(FILE);

my @newlines;
foreach $line ( @lines ) {

  if ($line =~ /net.nanopay.fx.ascendantfx.AscendantFXCredientials/) {

    my $regex = qr/\"host\":/p;
    my $subst = '"url":';
    $line = $line =~ s/$regex/$subst/r;

}

push(@newlines,$line);

}

open(FILE, ">$TMP") || die "File not found";
print FILE @newlines;
close(FILE);

move $TMP, $SERVICES || die "move $TMP, $SERVICES failed: $!";
