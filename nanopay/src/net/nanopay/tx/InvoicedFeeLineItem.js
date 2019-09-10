foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'InvoicedFeeLineItem',
  extends: 'net.nanopay.tx.FeeLineItem',

  documentation: 'A Fee LineItem whereby the fee collection occurs after the Transaction during some billing period. ',

  properties: [
    {
      class: 'String',
      name: 'description'
    }
  ],

  methods: [
    {
      name: 'createTransfers',
      type: 'net.nanopay.tx.Transfer[]',
      javaCode: `
        return new Transfer[0];
      `
    },
  ]
});
