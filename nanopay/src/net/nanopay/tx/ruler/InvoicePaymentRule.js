foam.CLASS({
  package: 'net.nanopay.tx.ruler',
  name: 'InvoicePaymentRule',

  documentation: `
    Permits users to pay invoice using bank account to bank account transactions.
  `,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.nanos.auth.AuthorizationException',
    'foam.nanos.auth.AuthService'
  ],

  messages: [
    {
      name: 'PROHIBITED_MESSAGE',
      message: 'You do not have permission to pay invoices. '
    }
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        AuthService auth = (AuthService) x.get("auth");
        if ( ! auth.check(x, "invoice.pay") ) {
          throw new AuthorizationException(PROHIBITED_MESSAGE);
        }
      `
    }
  ]
});