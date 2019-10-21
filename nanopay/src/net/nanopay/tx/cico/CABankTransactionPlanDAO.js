foam.CLASS({
  package: 'net.nanopay.tx.cico',
  name: 'CABankTransactionPlanDAO',
  extends: 'foam.dao.ProxyDAO',
  abstract: true,

  javaImports: [
    'foam.dao.DAO',
    'foam.dao.ArraySink',
    'foam.mlang.MLang',
    'foam.mlang.sink.Count',
    'foam.nanos.logger.Logger',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.bank.CABankAccount',
    'net.nanopay.tx.Transfer',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.payment.PaymentProvider',
    'java.util.ArrayList',
    'java.util.List'
  ],

  constants: [
    {
      name: 'PROVIDER_ID',
      type: 'String',
      value: 'NONE'
    }
  ],

  methods: [
    {
      name: 'createCITransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'Transaction'
        },
      ],
      type: 'Transfer[]',
      javaCode: `
      BankAccount sourceAccount = (BankAccount) txn.findSourceAccount(x);
      TrustAccount trustAccount = sourceAccount.findTrustAccount(x);
      List all = new ArrayList();
      all.add(new Transfer.Builder(x)
          .setDescription(trustAccount.getName()+" Cash-In")
          .setAccount(trustAccount.getId())
          .setAmount(-txn.getTotal())
          .build());
      all.add(new Transfer.Builder(x)
          .setDescription("Cash-In")
          .setAccount(txn.getDestinationAccount())
          .setAmount(txn.getTotal())
          .build());

      return (Transfer[]) all.toArray(new Transfer[0]);
      `
    },
    {
      name: 'createCOTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'txn',
          type: 'Transaction'
        },
      ],
      type: 'Transfer[]',
      javaCode: `
      BankAccount destinationAccount = (BankAccount) txn.findDestinationAccount(x);
      TrustAccount trustAccount = destinationAccount.findTrustAccount(x);
      List all = new ArrayList();
      all.add(new Transfer.Builder(x)
          .setDescription(trustAccount.getName()+" Cash-Out")
          .setAccount(trustAccount.getId())
          .setAmount(txn.getTotal())
          .build());
      all.add( new Transfer.Builder(x)
          .setDescription("Cash-Out")
          .setAccount(txn.getSourceAccount())
          .setAmount(-txn.getTotal())
          .build());

      return (Transfer[]) all.toArray(new Transfer[0]);
      `
    },
    {
      name: 'usePaymentProvider',
      type: 'Boolean',
      args: [
        {
          name: 'x',
          type: 'foam.core.X'
        },
        {
          name: 'providerId',
          type: 'String'
        },
        {
          name: 'bankAccount',
          type: 'net.nanopay.bank.BankAccount'
        },
        {
          name: 'isDefault',
          type: 'Boolean'
        }
      ],
      javaCode: `
      ArrayList<PaymentProvider> paymentProviders = PaymentProvider.findPaymentProvider(x, bankAccount);
      if ( paymentProviders.size() == 0 &&
           isDefault) {
        return true;
      }
      return paymentProviders.stream().filter( (paymentProvider)-> paymentProvider.getName().equals(providerId)).count() > 0;
      `
    }
  ]
});
