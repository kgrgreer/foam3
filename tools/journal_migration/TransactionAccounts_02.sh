#!/usr/bin/perl -w

# Replace transaction payerId and payeeId with either
# bank account or default digital account.
# Bank Account becomes source for Cash-In destination for Cash-Out.

# DEV NOTE: my (Joel) perl is really really rusty. This is very brute force, but it's a one off for migration.

#use strict;
use File::Copy 'move';
my $TMP = "/opt/nanopay/journals/transactions.tmp";
my $TRANS = "/opt/nanopay/journals/transactions";

# See upgrade/accounts for hand crafted default digital accounts existing nanopay customers.
my %data = (
        1357=>100,
        1358=>101,
        1360=>103,
        1361=>104,
        1364=>107,
        1365=>108,
        1367=>110,
        1376=>119,
        1377=>120,
        1378=>121,
        1379=>122,
        1402=>155,
        1409=>162,
        1410=>163,
        1411=>164,
        1413=>166,
        1417=>170,
        1419=>172,
        1420=>173,
        1421=>174,
        1423=>176,
        1428=>181,
        1441=>194,
        1442=>195,
        1443=>195,
        1446=>198
    );
open(FILE, "<$TRANS") || die "File not found: $TRANS";
my @lines = <FILE>;
close(FILE);

my @newlines;
foreach $line ( @lines ) {

    print "in: $line\n";
    if ($line =~ /payerId\":(\d+)/) {
        $key = $1;
        $value = $data{$key};
        if ($value) {
            print "payer: key=$key, value=$value\n";
            $line =~ s/^(.*?)payerId\":(\d+),(.*?)$/$1sourceAccount\":$value,$3/;
            print "out: $line\n";
            push(@newlines,$line);
        } else {
            print "key=$key not found\n";
        }
    }
    if ($line =~ /payeeId\":(\d+)/) {
        $key = $1;
        $value = $data{$key};
        if ($value) {
            print "payee: key=$key, value=$value\n";
            $line =~ s/^(.*?)payeeId\":(\d+),(.*?)$/$1destinationAccount\":$value,$3/;
            print "out: $line\n";
            push(@newlines,$line);
        } else {
            print "key=$key not found\n";
        }
    }

}

open(FILE, ">$TMP") || die "File not found";
print FILE @newlines;
close(FILE);

move $TMP, $TRANS || die "move $TMP, $TRANS failed: $!";
