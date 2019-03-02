#!/usr/bin/perl -w

# Replace transaction payerId and payeeId with either
# bank account or default digital account.
# Bank Account becomes source for Cash-In

# DEV NOTE: my (Joel) perl is really really rusty. This is very brute force, but it's a one off for migration.

#use strict;
use File::Copy 'move';
my $TMP = "/opt/nanopay/journals/transactions.tmp";
my $TRANS = "/opt/nanopay/journals/transactions";

# See upgrade/accounts for hand crafted default digital accounts existing nanopay customers.
# ignore
# 1401 - kirk
# 1348 - temp

my %digital = (
    1357=>200,
    1358=>201,
    1360=>203,
    1361=>204,
    1364=>207,
    1365=>208,
    1367=>210,
    1376=>219,
    1377=>220,
    1378=>221,
    1379=>222,
    1402=>255,
    1409=>262,
    1410=>263,
    1411=>264,
    1413=>266,
    1416=>269,
    1417=>270,
    1418=>271,
    1419=>272,
    1420=>273,
    1421=>274,
    1422=>275,
    1423=>276,
    1428=>281,
    1430=>283,
    1431=>284,
    1436=>289,
    1440=>293,
    1441=>294,
    1442=>295,
    1443=>296,
    1444=>297,
    1446=>298,
    1465=>319,
    1467=>321,
    1468=>322,
    1469=>323,
    1470=>324,
    1471=>325,
    1472=>326,
    1473=>327
    );

my %bank = (
    1356=>401,
    1354=>402,
    1357=>403,
    1358=>404,
    1360=>420,
    1361=>406,
    1364=>443,
    1365=>412,
    1367=>413,
    1368=>405,
    1376=>408,
    1378=>407,
    1379=>409,
    1401=>410,
    1402=>411,
    1409=>421,
    1411=>418,
    1417=>423,
    1419=>425,
    1420=>438,
    1421=>427,
    1422=>426,
    1428=>428,
    1430=>437,
    1431=>440,
    1436=>442,
    1440=>444,
    1443=>446,
    1465=>447,
    1467=>448,
    1472=>449,
    1473=>450
    );

open(FILE, "<$TRANS") || die "File not found: $TRANS";
my @lines = <FILE>;
close(FILE);


my @newlines;
foreach $line ( @lines ) {

    #print "in: $line\n";
    if ($line =~ /payerId\":(\d+)/) {
        $key = $1;
        $value = $digital{$key};
        if ($value) {
            #print "payer: key=$key, value=$value\n";
            $line =~ s/^(.*?)payerId\":(\d+),(.*?)$/$1sourceAccount\":$value,$3/;
            #print "out: $line\n";
        } else {
            print "key=$key not found (payerid)\n";
            next;
        }
    }
    if ($line =~ /payeeId\":(\d+)/) {
        $key = $1;
        $value = $digital{$key};
        if ($value) {
            #print "payee: key=$key, value=$value\n";
            $line =~ s/^(.*?)payeeId\":(\d+),(.*?)$/$1destinationAccount\":$value,$3/;
            #print "out: $line\n";
        } else {
            print "key=$key not found (payeeId)\n";
            next;
        }
    }
    if ($line =~ /destination_Bank_Account\":(\d+)/) {
        $key = $1;
        $value = $bank{$key};
        if ($value) {
            #print "payee: key=$key, value=$value\n";
            $line =~ s/^(.*?)destination_Bank_Account\":(\d+),(.*?)$/$1destinationAccount\":$value,$3/;
            #print "out: $line\n";
        } else {
            print "key=$key not found (payee bank)\n";
            next;
        }
    }

    if ($line =~ /DigitalTransaction/) {
        $line =~ s/(.*?)DigitalTransaction\"(.*?)sourceAccount\":(\d+)(.*?)destinationAccount\":(\d+)(.*?)amount\":(\d+)(.*?)}\)/$1DigitalTransaction\"$2sourceAccount\":$3$4destinationAccount\":$5$6amount\":$7$8,"status":5,"transfers":[{"class":"net.nanopay.tx.Transfer","amount":-$7,"account":$3},{"class":"net.nanopay.tx.Transfer","amount":$7,"account":$5}]})/;
    }

    if ($line =~ /BankAccount\":(\d+)/) {
        $key = $1;
        $value = $key + 400;
        $line =~ s/BankAccount\":(\d+)/Account\":$value/;
    }

    if ($line !~ /status/) {
        $line =~ s/\"isQuoted\":true/\"isQuoted\":true,\"status\":5/;
    }
    push(@newlines,$line);
}

open(FILE, ">$TMP") || die "File not found";
print FILE @newlines;
close(FILE);

move $TMP, $TRANS || die "move $TMP, $TRANS failed: $!";
