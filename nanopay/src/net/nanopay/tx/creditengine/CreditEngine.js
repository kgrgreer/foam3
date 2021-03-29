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
  package: 'net.nanopay.tx.creditengine',
  name: 'CreditEngine',
  documentation: `THis is where credits are calculated and applied to the transaction
  promos can be applied "per fee", or as a general bonus on the transaction.
  promos can also do other stuff too after the credit engine is done calculating them.
  `,

  javaImports: [
    'foam.nanos.logger.Logger',
    'foam.nanos.auth.User',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.util.SafetyUtil',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.SummarizingTransaction',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.CreditLineItem',
    'net.nanopay.tx.FeeLineItem',
    'foam.core.ValidationException',
    'net.nanopay.tx.Transfer',
    'java.util.ArrayList',
    'java.util.List',
    'java.util.HashSet',
    'net.nanopay.account.Account',
    'foam.mlang.sink.Count',
    'net.nanopay.tx.creditengine.CreditCodeAccount',
    'net.nanopay.tx.ValueMovementTransaction'
  ],

  methods: [
    {
      name: 'calculateCredits',
      args: [
        { name: 'x', type: 'Context'},
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction'}
      ],
      type: 'net.nanopay.tx.model.Transaction',
      javaCode: `
        // --- Deal With Incoming Transactions ---
        if ( txn != null ) {
          if (txn instanceof SummarizingTransaction) {
            return txn;
          }
          if ( txn instanceof ValueMovementTransaction ) {
            DAO creditCodeDAO = (DAO) x.get("localCreditCodeDAO");
            // check if credit code exists, if so, only retain if not duplicate, and if applicable.

            ArrayList<CreditLineItem> credits = new ArrayList<CreditLineItem>();
            HashSet<String> codeHash = new HashSet<String>(txn.getCreditCodes().length);

            for ( String code : txn.getCreditCodes()) {
              CreditCodeAccount creditCode = (CreditCodeAccount) creditCodeDAO.find(code);
              if ( creditCode != null ) {
                CreditLineItem[] clis = creditCode.createLineItems(x,txn);
                if ( clis != null && clis.length > 0 ) {
                  if ( codeHash.add(code) ) {
                    for( CreditLineItem cli : clis ) {
                      credits.add(cli);
                    }
                  }
                }
              }
            }

            txn.setCreditCodes((String []) codeHash.toArray(new String[codeHash.size()] ));
            txn.addLineItems((CreditLineItem[]) credits.toArray(new CreditLineItem[credits.size()] ));
            return txn;
          } else {
            return txn;
          }
        }
        throw new RuntimeException("incorrect input to creditEngine");
      `
    }
  ]
});
