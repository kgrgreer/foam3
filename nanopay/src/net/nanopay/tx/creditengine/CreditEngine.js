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
  extends: 'foam.dao.ProxyDAO',
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
    'net.nanopay.account.Account',
    'foam.mlang.sink.Count',
    'net.nanopay.tx.creditengine.AbstractCreditCode'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        // --- Deal With Incoming Transactions ---
        if ( obj != null && obj instanceof Transaction ) {
          if (obj instanceof SummarizingTransaction) {
            return obj;
          }
          Transaction t = (Transaction) obj;


          AbstractCreditCode creditCode = t.findCreditCode(x);

          //apply credit line items..
          t.addLineItems(calculateCredits_(creditCode, t));
          return t;

        }

        // --- Deal with incoming creditCodes ---
        if ( obj != null && obj instanceof AbstractCreditCode ) {
          return super.put_(x, obj);
        }

      `
    },
    {
      name: 'calculateCredits_',
      args: [
        { name: 'creditCode', type: 'net.nanopay.tx.creditengine.AbstractCreditCode' },
        { name: 't', type: 'net.nanopay.tx.model.Transaction' },
      ],
      type: 'net.nanopay.tx.CreditLineItem[]',
      javaCode: `
        ArrayList<CreditLineItem> credits = new ArrayList<CreditLineItem>();
        // --- apply per fee ---
        for (TransactionLineItem tli : t.getLineItems()) {
          if ( tli instanceof FeeLineItem ) {
            FeeLineItem fli = (FeeLineItem) tli;
            CreditLineItem cli = creditCode.createOnFee(fli);
            if ( cli != null ) {
              credits.add(cli);
            }
          }
        }
        // --- apply per Transaction ---
        CreditLineItem cli = creditCode.createOnTransaction(t);
        if ( cli != null ) {
          credits.add(cli);
        }
        return (CreditLineItem[]) credits.toArray(new CreditLineItem[credits.size()] );
      `
    },

  ]
});
