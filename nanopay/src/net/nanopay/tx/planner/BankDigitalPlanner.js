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
  package: 'net.nanopay.tx.planner',
  name: 'BankDigitalPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: `Planner for bank to digital where the owners differ`,

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  properties: [
    {
      name: 'multiPlan_',
      value: true
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        Account sourceAccount = quote.getSourceAccount();
        DigitalAccount sourceDigitalAccount = DigitalAccount.findDefault(x, sourceAccount.findOwner(x), sourceAccount.getDenomination());
        
        // Split 1: ABank -> ADigital
        Transaction t1 = new Transaction(x);
        t1.copyFrom(requestTxn);
        t1.setDestinationAccount(sourceDigitalAccount.getId());

        // ADigital -> BDigital
        Transaction t2 = new Transaction(x);
        t2.copyFrom(requestTxn);
        t2.setSourceAccount(sourceDigitalAccount.getId());

        Transaction[] digitals = multiQuoteTxn(x, t2);
        Transaction[] CIs = multiQuoteTxn(x, t1);
        for ( Transaction tx1 : digitals ) {
          for ( Transaction tx2 : CIs ) {
            Transaction CI = (Transaction) tx2.fclone();
            CI.addNext((Transaction) tx1.fclone());
            quote.getAlternatePlans_().add(CI);
          }
        }
        return null;
      `
    },
  ]
});
