foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'AbstractReceiptGenerator',
  abstract: true,

  implements: [
    'net.nanopay.security.receipt.ReceiptGenerator',
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          protected abstract void add_(foam.core.FObject obj);
        `);
      }
    }
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.ReceiptGenerationPolicy',
      name: 'receiptGenerationPolicy'
    }
  ],

  methods: [
    {
      name: 'add',
      javaCode: `
        getReceiptGenerationPolicy().update(obj);
        add_(obj);
      `
    },
    {
      name: 'start',
      javaCode: `getReceiptGenerationPolicy().start();`
    }
  ]
});
