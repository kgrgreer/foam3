/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

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
    'foam.util.SafetyUtil',
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.liquidity.LiquidityService',
    'net.nanopay.fx.FXTransaction',
    'net.nanopay.tx.cico.CITransaction',
    'net.nanopay.tx.cico.COTransaction',
    'net.nanopay.tx.DigitalTransaction',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.util.Frequency',
    'foam.nanos.auth.LifecycleState'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        if ( (obj instanceof DigitalTransaction || obj instanceof CITransaction || obj instanceof COTransaction || obj instanceof FXTransaction ) ) {
          Transaction txn = (Transaction) obj;
          if ( ! (txn.getStatus() == TransactionStatus.COMPLETED)  )
            return;
          if ( txn.getLifecycleState() != LifecycleState.ACTIVE )
            return;
          LiquidityService ls = (LiquidityService) x.get("liquidityService");
          Account source = txn.findSourceAccount(x);
          Account destination = txn.findDestinationAccount(x);
          if ( (! SafetyUtil.equals(source.getOwner(), destination.getOwner()) ) || txn instanceof DigitalTransaction || txn instanceof FXTransaction ) {
            agency.submit(x, new ContextAgent() {
              @Override
              public void execute(X x) {
                if( source instanceof DigitalAccount )
                  ls.liquifyAccount(source.getId(), Frequency.PER_TRANSACTION, -txn.getAmount());
                if ( destination instanceof DigitalAccount )
                  ls.liquifyAccount(destination.getId(), Frequency.PER_TRANSACTION, txn.getAmount());
              }
            }, "Liquid Rule");
          }
        }
      `
    }
  ]
});
