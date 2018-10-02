foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGenerationDAO',
  extends: 'foam.dao.ProxyDAO',

  methods: [
    {
      name: 'put_',
      javaCode: `
        return super.put_(x, obj);
      `
    },
    {
      name: 'remove_',
      javaCode: `
        return super.remove_(x, obj);
      `
    }
  ]
});
