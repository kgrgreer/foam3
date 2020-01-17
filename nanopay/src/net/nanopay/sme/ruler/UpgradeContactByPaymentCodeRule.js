foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'UpgradeContactByPaymentCodeRule',
    extends: 'foam.dao.ProxyDAO',

    documentation: ` A rule that populates contact's businessId property with
      the id of the business that shares the same payment code. Triggers when
      payment code is added to contact.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'net.nanopay.contacts.Contact',
      'net.nanopay.payment.PaymentCode'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `

          DAO       paymentCodeDAO =   (DAO) x.get("localPaymentCodeDAO");
          Contact   newContact     =   (Contact) obj;
          Contact   oldContact     =   (Contact) oldObj;

          if ( ! newContact.getPaymentCode.equals(oldContact.getPaymentCode) ) {
            throw new RuntimeException("Same Business");
          }

          PaymentCode paymentCode = (PaymentCode) paymentCodeDAO.find(newContact.getPaymentCode());
          if (paymentCode == null) {
            throw new RuntimeException("Invalid payment code. Please try again.");
          }

          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              newContact.setBusinessId(paymentCode.getOwner());
            }
          }, "upgrade contact");
        `
      }
    ]
});
