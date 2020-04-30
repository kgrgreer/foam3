foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'AlternaCITransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  javaImports: [
    'net.nanopay.account.TrustAccount',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.tx.alterna.AlternaCITransaction',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem'
  ],

  constants: [
    {
      name: 'INSTITUTION_NUMBER',
      type: 'String',
      value: '842'
    }
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        TrustAccount trustAccount = TrustAccount.find(x, quote.getSourceAccount(), INSTITUTION_NUMBER);
        AlternaCITransaction t = new AlternaCITransaction();
        t.copyFrom(requestTxn);
        t.setStatus(net.nanopay.tx.model.TransactionStatus.PENDING);
        t.setInstitutionNumber(INSTITUTION_NUMBER);
        quote.addTransfer(trustAccount.getId(), -t.getAmount());
        quote.addTransfer(quote.getDestinationAccount().getId(), t.getAmount());
        t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);

        if ( PADTypeLineItem.getPADTypeFrom(x, t) == null ) {
          PADTypeLineItem.addEmptyLineTo(t);
        }
        return t;
    `
    }
  ]
});
