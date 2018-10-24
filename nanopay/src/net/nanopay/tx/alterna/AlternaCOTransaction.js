foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'java.util.Arrays',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
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
           getStatus().equals(TransactionStatus.PENDING) ||
           getStatus().equals(TransactionStatus.DECLINED);
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

      if ( oldTxn == null ) {
        if ( getStatus() == TransactionStatus.PENDING || getStatus() == TransactionStatus.COMPLETED ) {
        Transfer transfer = new Transfer.Builder(x)
                                      .setDescription(trustAccount.getName()+" Cash-Out")
                                      .setAccount(trustAccount.getId())
                                      .setAmount(getTotal())
                                      .build();
                tr = new Transfer[] {
                  transfer,
                  new Transfer.Builder(x)
                    .setDescription("Cash-Out")
                    .setAccount(getSourceAccount())
                    .setAmount(-getTotal())
                    .build()
                };
                }
      } else if ( getStatus() == TransactionStatus.DECLINED ) {
        Transfer transfer = new Transfer.Builder(x)
                              .setDescription(trustAccount.getName()+" Cash-Out DECLINED")
                              .setAccount(trustAccount.getId())
                              .setAmount(-getTotal())
                              .build();
        tr = new Transfer[] {
          transfer,
          new Transfer.Builder(x)
            .setDescription("Cash-Out DECLINED")
            .setAccount(getSourceAccount())
            .setAmount(getTotal())
            .build()
        };
        Transfer[] replacement = Arrays.copyOf(getReverseTransfers(), getReverseTransfers().length + tr.length);
        System.arraycopy(tr, 0, replacement, getReverseTransfers().length, tr.length);
        setStatus(TransactionStatus.REVERSE);
        return replacement;
      } else return new Transfer[0];

      Transfer[] replacement = Arrays.copyOf(getTransfers(), getTransfers().length + tr.length);
            System.arraycopy(tr, 0, replacement, getTransfers().length, tr.length);
            return replacement;
      `
    }
  ]
});
