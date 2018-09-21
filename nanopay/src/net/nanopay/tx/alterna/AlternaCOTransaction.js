foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  javaImports: [
    'java.util.HashMap',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.bank.BankAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer'
  ],

  properties: [
    {
      class: 'String',
      name: 'confirmationLineNumber',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnCode',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnDate',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'returnType',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'referenceNumber',
      visibility: foam.u2.Visibility.RO
    },
    {
      class: 'String',
      name: 'padType'
    },
    {
      class: 'String',
      name: 'txnCode'
    },
    {
      class: 'String',
      name: 'description',
      swiftName: 'description_',
      visibility: foam.u2.Visibility.RO
    },
  ],

  methods: [
    {
      name: 'createTransfers',
      javaReturns: 'Transfer[]',
      javaCode: `
      Transfer [] tr = new Transfer[] {};
      Account account = findSourceAccount(getX());
      TrustAccount trustAccount = TrustAccount.find(getX(), account);

      Long amount = getTotal();
      if ( getStatus() == TransactionStatus.DECLINED ||
           getStatus() == TransactionStatus.PENDING ) {
        if ( getStatus() == TransactionStatus.DECLINED ) {
          amount = -amount;
        }
        Transfer transfer = new Transfer.Builder(getX())
                              .setAccount(trustAccount.getId())
                              .setAmount(amount)
                              .build();
        tr = new Transfer[] {
          transfer,
          new Transfer.Builder(getX())
            .setAccount(getSourceAccount())
            .setAmount(amount)
            .build()
        };
      }

      add(tr);
      return getTransfers();
      `
    }
  ]
});
