foam.CLASS({
  package: 'net.nanopay.tx.model',
  name: 'TopUpTransaction',
  extends: 'net.nanopay.tx.model.Transaction',
  javaImports: [
    'net.nanopay.tx.Transfer',
    'java.util.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(foam.java.Code.create({
          data: `
            public Transfer[] createTransfers(foam.core.X x, Transaction oldTxn) {

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
                      Transfer[] replacement = Arrays.copyOf(getTransfers(), getTransfers().length + tr.length);
                      System.arraycopy(tr, 0, replacement, getTransfers().length, tr.length);
                      return replacement;

              }
        `}));
      }
    }
  ]
})
