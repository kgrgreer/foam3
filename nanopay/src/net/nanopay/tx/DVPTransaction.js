foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'DVPTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  javaImports: [
    'net.nanopay.account.Account',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.model.TransactionStatus'
  ],

  documentation: 'Used solely to present a summary of LineItems for Securities DVP Transactions',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'sourcePaymentAccount',
      required: true
    },
    {
      class: 'Reference',
      of: 'net.nanopay.account.Account',
      name: 'destinationPaymentAccount',
      required: true
    },
    {
      class: 'Long',
      name: 'paymentAmount',
      required: true
    },
    {
      class: 'Long',
      name: 'destinationPaymentAmount',
      required: true
    }
  ],
  methods: [
    {
      name: 'addNext',
      args: [
        { name: 'txn', type: 'net.nanopay.tx.model.Transaction' }
      ],
      javaCode: `
        Transaction tx = this;
        Transaction [] t = tx.getNext();
        int size = (t != null) ? t.length : 0;
        Transaction [] t2 = new Transaction [size+1];
        System.arraycopy(t,0,t2,0,t.length);
        t2[t2.length-1] = txn;
        tx.setNext(t2);
      `
    }
  ]
});
