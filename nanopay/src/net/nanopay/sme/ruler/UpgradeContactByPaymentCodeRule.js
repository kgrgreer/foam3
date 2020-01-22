foam.CLASS({
    package: 'net.nanopay.sme.ruler',
    name: 'UpgradeContactByPaymentCodeRule',
    extends: 'foam.dao.ProxyDAO',

    documentation: ` A rule that populates contact's businessId property with
      the id of the business associated to the given payment code. Triggers when
      contact's createdUsingPaymentCode property is set to true.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'net.nanopay.contacts.Contact',
      'net.nanopay.model.Business',
      'net.nanopay.payment.PaymentCode'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `

          DAO       paymentCodeDAO   =   (DAO) x.get("localPaymentCodeDAO");
          DAO       businessDAO      =   (DAO) x.get("localBusinessDAO");
          Business  loggedInBusiness =   (Business) x.get("user");
          Contact   contact          =   (Contact) obj;
          String    paymentCode =   contact.getPaymentCode();

          // check if given paymentcode is valid
          PaymentCode validatedPaymentCode = (PaymentCode) paymentCodeDAO.find(paymentCode);
          if ( validatedPaymentCode == null ) {
            throw new RuntimeException("Invalid payment code. Please try again.");
          }

          // check if id associated to payment code is a business
          Business business = (Business) businessDAO.find(validatedPaymentCode.getOwner());
          if ( business == null || ((Long) business.getId()).equals(loggedInBusiness.getId())) {
            throw new RuntimeException("Invalid payment code. Please try again.");
          }

          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              contact.setOrganization(business.getOrganization());
              contact.setBusinessName(business.getOrganization());
              contact.setBusinessId(business.getId());
              //Overwriting with business email will need refactoring with coming changes
              contact.setEmail(business.getEmail());
            }
          }, "upgrade contact");
        `
      }
    ]
});
