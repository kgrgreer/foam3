IGNORE('net/nanopay/merchant/merchant.js');
IGNORE('net/nanopay/merchant/libs');

BROKEN('net/nanopay/auth/ui/TwoAuthView.js');
BROKEN('net/nanopay/retail/ui/transactions/TransactionsView.js');

// This "rows.js" file depends on foam.String to execute
INJECT('net/nanopay/liquidity/ucjQuery/ui/rows.js', `
foam.String = foam.realfoam.String;
`);
