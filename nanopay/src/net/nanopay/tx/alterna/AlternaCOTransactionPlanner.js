foam.CLASS({
  package: 'net.nanopay.tx.alterna',
  name: 'AlternaCOTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  javaImports: [
    'net.nanopay.account.TrustAccount',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem'
  ],

  constants: [
    {
      name: 'PROVIDER_ID',
      type: 'String',
      value: 'Alterna'
    },
    {
      name: 'INSTITUTION_NUMBER',
      type: 'String',
      value: '842'
    }
  ],

  methods: [
    {
      name: 'plannerLogic',
      javaCode: `
        TrustAccount trustAccount = TrustAccount.find(x, quote.getSourceAccount(), INSTITUTION_NUMBER);
        AlternaCOTransaction t = new AlternaCOTransaction.Builder(x).build();
        t.copyFrom(requestTxn);
        t.setInstitutionNumber(INSTITUTION_NUMBER);
        addTransfer(trustAccount.getId(), t.getAmount());
        addTransfer(quote.getSourceAccount().getId(), -t.getAmount());
        t.addLineItems(new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 2 days */ 172800000L).build()}, null);

        if ( PADTypeLineItem.getPADTypeFrom(x, t) == null ) {
          PADTypeLineItem.addEmptyLineTo(t);
        }
        return t;
    `
    }
  ]
});
