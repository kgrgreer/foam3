#!/usr/bin/perl -w

# Rule - Id <- Name
# RuleHistory - ruleId

use File::Copy 'move';
my $RULES = "/opt/nanopay/journals/rules";
my $RULE_HISTORY = "/opt/nanopay/journals/ruleHistory";

my %rule = (
    # net/nanopay/meter/compliance/ruler/rules.jrl
    1000=>"Canadian Sanctions",
    1010=>"Request signing officers compliance",
    1011=>"Request beneficial owners compliance",
    1100=>"Securefact SIDni",
    1101=>"Securefact LEV",
    1200=>"Dow Jones Person KYC - User onboarding",
    1201=>"Dow Jones Entity KYC - Business onboarding",
    1202=>"Dow Jones Beneficial Owner KYC - Beneficial Owner onboarding",
    1300=>"User Final Compliance Rule",
    1301=>"Business Final Compliance Rule",
    1310=>"Transaction Final Compliance Rule",
    1400=>"IdentityMind Consumer KYC - Signup",
    1410=>"IdentityMind Entity Login Record",
    1420=>"IdentityMind Merchant KYC",
    1430=>"IdentityMind Consumer KYC - Signing officer",
    1431=>"IdentityMind Consumer KYC - Beneficial owner",
    1440=>"IdentityMind transfer transaction",
    1500=>"Clear user approval requests",
    1501=>"Clear transaction approval requests",
    1510=>"User compliance approval",
    1520=>"Compliance transaction approval",
    1521=>"Remove compliance user approval",
    1600=>"Create ComplianceItem - DowJones Creation",
    1610=>"Create ComplianceItem - IdentityMind Creation",
    1620=>"Create ComplianceItem - SecureFact(LEV) Creation",
    1630=>"Create ComplianceItem - SecureFact(SIDni) Creation",
    1640=>"Remove ComplianceItem - DowJones Removal",
    1650=>"Remove ComplianceItem - IdentityMind Removal",
    1660=>"Remove ComplianceItem - SecureFact(LEV) Removal",
    1670=>"Remove ComplianceItem - SecureFact(SIDni) Removal",
    1700=>"Reset transaction lastModified/By properties",
    1701=>"Add Domestic Currency Permission",
    1703=>"Add FX Provision Payer Permission after Business is onboarded",
    1704=>"Remove FX Provision Payer Permission after Business is not onboarded",
    1710=>"Estimate Transaction completionDate",

    # foam/nanos/crunch/rules.jrl
    1800=>"Notify User On Top Level Capability Status Update",
    1804=>"Remove UserCapabilityJunctions on User Deletion",

    # net/nanopay/account/rules.jrl
    2000=>"No Duplicate Accounts",
    2001=>"Pending Transactions",
    2002=>"Has Children",
    2003=>"Balance not 0",
    2004=>"Currency Permission Check - Accounts",
    2005=>"Currency Permission Check - Transactions",
    2006=>"Currency Permission Check - Invoices",
    2007=>"Create Default Digital Account",

    # net/nanopay/tx/rules.jrl
    2010=>"Pending FX Rate Transactions",
    2011=>"Getting FX Rate for Transactions",
    3000=>"The Jackie Rule1",
    3001=>"The Jackie Rule2",
    3002=>"DebtDestroyer",
    3004=>"Proper Status after Pause Rule",
    3005=>"Set Approved By",
    3006=>"SwitchToSlowPay",
    3007=>"Modify Cico Status",
    3008=>"Create Expedite Aproval Request",
    3009=>"Prune Cico Approval Cleanup",
    3020=>"observeStatus",
    3100=>"Account Liquification",
    3200=>"Quote Transaction Based on Status",
    3201=>"ReverseCashOut",
    3202=>"ReverseCashIn",

    # net/nanopay/alarming/rules.jrl
    4000=>"Alarming & Monitoring",
    4100=>"Alarm Alerting",

    # net/nanopay/contacts/rules.jrl
    5000=>"Migrate Contacts - localAccountDAO",
    5001=>"Migrate Contacts - businessDAO",

    # net/nanopay/business/rules.jrl
    6000=>"Update business's email",

    # net/nanopay/tx/afex/rules.jrl
    8000=>"Add FX Currency Permission to Business",
    8005=>"Create AFEXBusiness Approval Request"
);

#
# Migrate /opt/nanopay/journals/rules
#
open(FILE, "<$RULES") || die "File not found: $RULES";
my @lines = <FILE>;
close(FILE);

# Capture rule.NAME updates and new rules to $rule map
foreach $line ( @lines ) {
    if ( $line =~ /name\":\"(.*?)\"/ ) {
        $value = $1;
        if ( $line =~ /id\":(\d+)/ ) {
            $key = $1;
            $rule{$key} = $value;
        }
    }
}

my @newlines;
# Replace "id":{$rule.key} with "id":"{$rule.value}"
foreach $line ( @lines ) {
    if ( $line =~ /id\":(\d+)/ ) {
        $key = $1;
        $value = $rule{$key};
        $line =~ s/id\":$key/id\":\"$value\"/;
    }
    push(@newlines, $line);
}

open(FILE, ">$RULES.tmp") || die "File not found";
print FILE @newlines;
close(FILE);

move "$RULES.tmp", $RULES || die "move $RULES.tmp, $RULES failed: $!";

#
# Migrate /opt/nanopay/journals/ruleHistory
#
open(FILE, "<$RULE_HISTORY") || die "File not found: $RULE_HISTORY";
@lines = <FILE>;
close(FILE);

@newlines = ();
# Replace "ruleId":{$rule.key} with "ruleId":"{$rule.value}"
foreach $line ( @lines ) {
    if ( $line =~ /ruleId\":(\d+)/ ) {
        $key = $1;
        $value = $rule{$key};
        $line =~ s/ruleId\":$key/ruleId\":\"$value\"/;
    }
    push(@newlines, $line);
}

open(FILE, ">$RULE_HISTORY.tmp") || die "File not found";
print FILE @newlines;
close(FILE);

move "$RULE_HISTORY.tmp", $RULE_HISTORY || die "move $RULE_HISTORY.tmp, $RULE_HISTORY failed: $!";
