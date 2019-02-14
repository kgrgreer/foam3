foam.CLASS({
  package: 'net.nanopay.fx.ascendantfx',
  name: 'AscendantFXCOTransaction',
  extends: 'net.nanopay.tx.cico.COTransaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.account.Account',
    'net.nanopay.account.TrustAccount',
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.tx.Transfer',
    'java.util.Arrays'
  ],

  methods: [
    {
      name: 'createTransfers',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'oldTxn',
          type: 'net.nanopay.tx.model.Transaction'
        }
      ],
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
      Transfer [] tr = new Transfer[] {};
      Account account = findSourceAccount(x);
      TrustAccount trustAccount = TrustAccount.find(x, account);

      if ( oldTxn == null && getStatus() == TransactionStatus.PENDING ) {
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
      } else if ( oldTxn.getStatus() == TransactionStatus.COMPLETED && getStatus() == TransactionStatus.DECLINED ) {
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
