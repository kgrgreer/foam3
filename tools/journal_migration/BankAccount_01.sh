#!/usr/bin/perl -w

# Convert model.BankAccounts to bank.CABankAccounts
# Also translate id up by 100 so not to conflict with newly added TrustAccounts.
# DEV NOTE: my (Joel) perl is really really rusty. This is very brute force, but it's a one off for migration.

#use strict;
use File::Copy 'move';
my $TMP = "/opt/nanopay/journals/accounts.tmp";
my $BANK_ACCOUNTS = "/opt/nanopay/journals/bankAccounts";
#my $ACCOUNTS = "/opt/nanopay/journals/accounts.1";

open(FILE, "<$BANK_ACCOUNTS") || die "File not found: $BANK_ACCOUNTS";
my @lines = <FILE>;
close(FILE);

my @newlines;
foreach $line ( @lines ) {

    #print "in: $line\n";

    $line =~ s/net.nanopay.model.BankAccount/net.nanopay.bank.CABankAccount/;
    $line =~ s/accountName/name/;
    $line =~ s/transitNumber/branchId/;
    $line =~ s/currencyCode\":(.*?),/denomination\":\"CAD\",\"country\":\"CA\",/;
    $line =~ s/setAsDefault/isDefault/;

    if ($line =~ /id\":(\d+)/) {
        $key = $1;
        $value = 300 + $key;
        #print "id: key=$key, value=$value\n";
        $line =~ s/^(.*?)\"id\":(\d+),(.*?)$/$1\"id\":$value,$3/;
        #print "out: $line\n";
        push(@newlines,$line);
    }
}

open(FILE, ">$TMP") || die "File not found";
print FILE @newlines;
close(FILE);

move $TMP, $BANK_ACCOUNTS || die "move $TMP, $BANK_ACCOUNTS failed: $!";
