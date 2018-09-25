foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'CancelHoldingDAOTest',
  extends: 'foam.nanos.test.Test',

  javaImports: [
    'foam.core.FObject',
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxyDAO',
    'foam.dao.Sink',
    'foam.mlang.order.Comparator',
    'foam.mlang.predicate.*',
    'foam.nanos.auth.User',
    'java.util.List',
    'java.util.ArrayList',
    'net.nanopay.contacts.Contact',
    'net.nanopay.invoice.model.Invoice',
    'net.nanopay.account.Account',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.account.HoldingAccount',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.TransactionType',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.bank.BankAccountStatus',
    'net.nanopay.invoice.model.InvoiceStatus',
    'net.nanopay.invoice.model.PaymentStatus'
  ],

  methods: [
    {
      name: 'runTest',
      javaReturns: 'void',
      javaCode: `
      `
    }
  ]

});
