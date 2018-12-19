foam.CLASS({
  package: 'net.nanopay.meter',
  name: 'BlockDisabledUserInvoiceDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `Decorating DAO for preventing disabled user
      from being added as a payer/payee of an invoice.`,

  javaImports: [
    'foam.nanos.auth.User',
    'net.nanopay.invoice.model.Invoice'
  ],

  constants: [
    {
      name: 'BLOCK_INVOICE',
      type: 'String',
      value: 'Invoice: %d is blocked because the %s is disabled.'
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        Invoice invoice = (Invoice) obj;
        User payer = invoice.findPayerId(x);
        User payee = invoice.findPayeeId(x);

        if ( ! payer.getEnabled() ) { blockInvoice(invoice, "payer"); }
        if ( ! payee.getEnabled() ) { blockInvoice(invoice, "payee"); }

        return super.put_(x, obj);
      `
    },
    {
      name: 'blockInvoice',
      javaReturns: 'void',
      args: [
        { of: 'Invoice', name: 'invoice' },
        { of: 'String', name: 'user' }
      ],
      javaCode: `
        throw new RuntimeException(
          String.format(BLOCK_INVOICE, invoice.getId(), user));
      `
    }
  ]
});
