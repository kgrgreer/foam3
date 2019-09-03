foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'InvoiceFeeLineItem',
  extends: 'net.nanopay.tx.FeeLineItem',

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
