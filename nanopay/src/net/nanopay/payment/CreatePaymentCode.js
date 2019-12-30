foam.CLASS({
  package: 'net.nanopay.payment',
  name: 'CreatePaymentCode',

  documentation: `Create a payment code on user creation.`,

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'net.nanopay.model.Business',
    'net.nanopay.payment.PaymentCode'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          DAO paymentCodeDAO = (DAO) x.get("paymentCodeDAO");
          PaymentCode paymentCode = new PaymentCode.Builder(x).setOwner(((User) obj).getId()).build();
          paymentCodeDAO.put_(x, paymentCode);
        }
      }, "Creating a payment code");
      `
    }
  ]
});
