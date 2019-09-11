foam.CLASS({
  package: 'net.nanopay.liquidity',
  name: 'LiquidityRule',

  documentation: `
    This rule triggers the liquidity service for CICO and Digital Transactions, on put or create in status completed.
    If the owners of the accounts in question are different, it will trigger liquidity on the Digital accounts involved.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.LiquidityService',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.util.Frequency'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( (obj instanceof DigitalTransaction || obj instanceof CITransaction || obj instanceof COTransaction) ) {
          Transaction txn = (Transaction) obj;
          if ( ! (txn.getStatus() == TransactionStatus.COMPLETED) )
            return;
          LiquidityService ls = (LiquidityService) x.get("liquidityService");
          Account source = txn.findSourceAccount(x);
          Account destination = txn.findDestinationAccount(x);
          if ( /*(! SafetyUtil.equals(source.getOwner(), destination.getOwner()) ) ||*/ txn instanceof DigitalTransaction ) {

                if( source instanceof DigitalAccount )
                  ls.liquifyAccountz(source.getId(), Frequency.PER_TRANSACTION, -txn.getAmount(),txn.getLastStatusChange());
                if ( destination instanceof DigitalAccount )
                  ls.liquifyAccountz(destination.getId(), Frequency.PER_TRANSACTION, txn.getAmount(),txn.getLastStatusChange());

          }
        }
      `
    }
  ]
});
