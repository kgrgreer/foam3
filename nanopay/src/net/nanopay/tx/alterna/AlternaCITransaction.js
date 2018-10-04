foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCITransaction',
  extends: 'net.nanopay.tx.cico.CITransaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer',
    'java.util.Arrays'
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
      name: 'isActive',
      javaReturns: 'boolean',
      javaCode: `
         return
           getStatus().equals(TransactionStatus.COMPLETED);
      `
    },
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          javaType: 'foam.core.X'
        },
        {
          name: 'oldTxn',
          javaType: 'Transaction'
        }
      ],
      javaReturns: 'Transfer[]',
      javaCode: `
      Transfer [] tr = new Transfer[] {};
      Account account = findSourceAccount(x);
      TrustAccount trustAccount = TrustAccount.find(x, account);

      if ( getStatus() == TransactionStatus.COMPLETED ) {

        Transfer transfer = new Transfer.Builder(getX())
                              .setDescription(trustAccount.getName()+" Cash-In")
                              .setAccount(trustAccount.getId())
                              .setAmount(-getTotal())
                              .build();
        tr = new Transfer[] {
          transfer,
          new Transfer.Builder(getX())
            .setDescription("Cash-In")
            .setAccount(getDestinationAccount())
            .setAmount(getTotal())
            .build()
        };
      } else if ( getStatus() == TransactionStatus.DECLINED &&
                  oldTxn != null &&
                  oldTxn.getStatus() == TransactionStatus.COMPLETED ) {

        Transfer transfer = new Transfer.Builder(x)
                              .setDescription(trustAccount.getName()+" Cash-In DECLINED")
                              .setAccount(trustAccount.getId())
                              .setAmount(getTotal())
                              .build();
        tr = new Transfer[] {
          transfer,
          new Transfer.Builder(x)
            .setDescription("Cash-In DECLINED")
            .setAccount(getDestinationAccount())
            .setAmount(-getTotal())
            .build()
        };
        setStatus(TransactionStatus.REVERSE);
      } else return new Transfer[0];
      return tr;
      `
    }
  ]
});
