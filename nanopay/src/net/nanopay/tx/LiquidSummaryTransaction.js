foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'LiquidSummaryTransaction',
  extends: 'net.nanopay.tx.SummaryTransaction',

  javaImports: [
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.InfoLineItem',
    'net.nanopay.tx.TransactionLineItem'
  ],

  requires: [
    'net.nanopay.tx.InfoLineItem'
  ],

  documentation: 'Used solely for submitting a Transaction from the front end or through api',

  properties: [
    {
      name: 'name',
      value: 'liquidSummary'
    },
    {
      name: 'referenceNumber',
      visibility: 'HIDDEN'
    },
    {
      name: 'lineItems',
      label: '',
      section: 'additionalInfo',
      javaFactory: `
        InfoLineItem ifl1 = new InfoLineItem();
        ifl1.setName("Memo");
        InfoLineItem ifl2 = new InfoLineItem();
        ifl2.setName("Reference Number");
        TransactionLineItem[] tli = new TransactionLineItem[] {ifl1, ifl2};
        return tli;
      `,
      updateVisibility: 'RO',
      createVisibility: 'RO',
      readVisibility: 'RO',
    },
  ],

  methods: [
    function init() {
      var arr = [] ;
      var ifl1 = this.InfoLineItem.create();
      var ifl2 = this.InfoLineItem.create();
      ifl1.name = "Memo";
      ifl2.name = "Reference Number";
      arr.push(ifl1);
      arr.push(ifl2);
      this.lineItems =  arr; }
  ]

});
