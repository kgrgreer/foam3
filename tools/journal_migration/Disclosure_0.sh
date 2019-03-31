#!/usr/bin/perl -w

# Convert Disclosure model to text string
# DEV NOTE: by (Mayowa) beginner perl but seem to get the job done for a one off for migration.

#use strict;
use File::Copy 'move';
my $TMP = "/opt/nanopay/journals/disclosure.tmp";
my $TRANSACTIONS = "/opt/nanopay/journals/transactions";

open(FILE, "<$TRANSACTIONS") || die "File not found: $TRANSACTIONS";
my @lines = <FILE>;
close(FILE);

my @newlines;
foreach $line ( @lines ) {

  my $sub = '';

  if ($line =~ /net.nanopay.fx.ascendantfx.AscendantFXDisclosure/) {
    if($line =~  /\"<p>(.*)<\/p>"/) {
      $sub =  "\"<p>" . $1 . "<\/p>\"";
    }

    my $regex1 = qr/\{\"class\":\"net.nanopay.fx.ascendantfx.AscendantFXDisclosure\"(.*?)}/p;
    $line = $line =~ s/$regex1/$sub/r;

    my $regex = qr/\"disclosure\":/p;
    my $subst = '"text":';
    $line = $line =~ s/$regex/$subst/r;

}

my $regex2 = qr/,{\"algorithm\":(.*)}/p;
my $subst2 = '';
$line = $line =~ s/$regex2/$subst2/r;

push(@newlines,$line);

}

open(FILE, ">$TMP") || die "File not found";
print FILE @newlines;
close(FILE);

move $TMP, $TRANSACTIONS || die "move $TMP, $TRANSACTIONS failed: $!";
