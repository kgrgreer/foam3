foam.CLASS({
  package: 'net.nanopay.tx.planner',
  name: 'RbcCOTransactionPlanner',
  extends: 'net.nanopay.tx.planner.AbstractTransactionPlanner',

  documentation: 'Plans CO Transaction for RBC',

  javaImports: [
    'net.nanopay.account.TrustAccount',
    'net.nanopay.payment.PADTypeLineItem',
    'net.nanopay.tx.ETALineItem',
    'net.nanopay.tx.TransactionLineItem',
    'net.nanopay.tx.rbc.RbcCOTransaction',
  ],

  constants: [
    {
      name: 'INSTITUTION_NUMBER',
      type: 'String',
      value: '003'
    },
  ],

  methods: [
    {
      name: 'plan',
      javaCode: `
        TrustAccount trustAccount = TrustAccount.find(x, quote.getSourceAccount(), INSTITUTION_NUMBER);
        RbcCOTransaction t = new RbcCOTransaction();
        t.copyFrom(requestTxn);
        t.setStatus(net.nanopay.tx.model.TransactionStatus.PENDING);
        t.setInstitutionNumber(INSTITUTION_NUMBER);
        quote.addTransfer(trustAccount.getId(), t.getAmount());
        quote.addTransfer(quote.getSourceAccount().getId(), -t.getAmount());

        t.addLineItems( new TransactionLineItem[] { new ETALineItem.Builder(x).setEta(/* 1 days */ 864800000L).build()} );
        if ( PADTypeLineItem.getPADTypeFrom(x, t) == null ) {
          PADTypeLineItem.addEmptyLineTo(t);
        }
        return t;

      `
    },
  ]
});
