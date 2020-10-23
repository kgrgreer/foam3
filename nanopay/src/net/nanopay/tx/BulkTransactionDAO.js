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
  package: 'net.nanopay.tx',
  name: 'BulkTransactionDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `
    Prepare the quote for bulk transaction planner.
  `,

  javaImports: [
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.account.Account',
    'foam.core.ValidationException',
    'net.nanopay.account.DigitalAccount',
    'net.nanopay.tx.model.Transaction'
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `

        var quote = (TransactionQuote) obj;
        if ( quote.getRequestTransaction() instanceof BulkTransaction ) {
          var bulkTxn       = (BulkTransaction) quote.getRequestTransaction();
          var sourceAccount = bulkTxn.findSourceAccount(x);
          var userDAO       = (DAO) x.get("localUserDAO");
          var payer         = (User) userDAO.find_(x, bulkTxn.getPayerId());

          if ( payer == null && sourceAccount == null ) {
            throw new RuntimeException("BulkTransaction failed to determine payer or sourceAccount. payerId: "
              + bulkTxn.getPayerId()
              + " sourceAccount: "
              + bulkTxn.getSourceAccount());
          }

          // Bulk transaction must have a payer
          if ( payer == null ) payer = sourceAccount.findOwner(x);

          // Set the source and destination accounts of the bulk transaction,
          // the head transaction in the final transaction chain, to the
          // payer's digital account since it's just a place holder and the
          // actual transfers will be planned by the BulkTransactionPlanner.
          var payerDigitalAccount = DigitalAccount.findDefault(x, payer, bulkTxn.getSourceCurrency());
          bulkTxn.setSourceAccount(payerDigitalAccount.getId());
          bulkTxn.setDestinationAccount(payerDigitalAccount.getId());

          // No need for payeeId on one-to-many transaction
          if ( bulkTxn.getChildren().length > 0 ) bulkTxn.clearPayeeId();

          // Adapt one-to-one transaction
          var payee = (User) userDAO.find_(x, bulkTxn.getPayeeId());
          if ( payee != null ) {
            bulkTxn.setChildren(new Transaction[] {
              new Transaction.Builder(x)
                .setPayeeId(payee.getId())
                .setAmount(bulkTxn.getAmount())
                .build()
            });
          }

          if ( bulkTxn.getChildren().length == 0 ) {
            throw new ValidationException("BulkTransaction missing child transactions.");
          }
        }
        return getDelegate().put_(x, obj);
      `
    }
  ],

  axioms: [
    {
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public BulkTransactionDAO(foam.core.X x, foam.dao.DAO delegate) {
            setDelegate(delegate);
          }
        `);
      },
    },
  ]
});
