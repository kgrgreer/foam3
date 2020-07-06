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
  package: 'net.nanopay.invoice',
  name: 'PreventRemoveInvoiceDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: 'Prevents removing invoices associated to other transaction or accounts.',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.mlang.sink.Count',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.HoldingAccount',
  
    'static foam.mlang.MLang.EQ'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public PreventRemoveInvoiceDAO(X x, DAO delegate) {
            setX(x);
            setDelegate(delegate);
          }   
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'remove_',
      javaCode: `
        DAO transactionDAO = (DAO) x.get("localTransactionDAO");
        DAO accountDAO = (DAO) x.get("localAccountDAO");
        Invoice invoice = (Invoice) obj;
        Count count = new Count();
        long total;

        total = ((Count) transactionDAO.where(
            EQ(Transaction.INVOICE_ID, invoice.getId())).limit(1).select(count)).getValue();

        if ( total == 0 )
          total += ((Count) accountDAO.where(
              EQ(HoldingAccount.INVOICE_ID, invoice.getId())).limit(1).select(count)).getValue();

        if ( total > 0 ) {
          invoice = (Invoice) invoice.fclone();
          invoice.setRemoved(true);
          return super.put_(x, invoice);
        }
        return super.remove_(x, invoice);
      `
    }
  ]
});

