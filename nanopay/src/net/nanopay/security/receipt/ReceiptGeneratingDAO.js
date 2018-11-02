foam.CLASS({
  package: 'net.nanopay.security.receipt',
  name: 'ReceiptGeneratingDAO',
  extends: 'foam.dao.ProxyDAO',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.security.receipt.ReceiptGenerator',
      name: 'generator'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        generator_.add(obj);
        Receipt receipt = generator_.generate(obj);
        System.out.println(new foam.lib.json.Outputter(
          foam.lib.json.OutputterMode.STORAGE).stringify(receipt));
        return super.put_(x, obj);
      `
    }
  ]
});
