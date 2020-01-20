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
          Contact   oldContact       =   (Contact) oldObj;
          String    paymentCodeValue =   contact.getPaymentCode();

          //check if your own paymentcode
          //run on create w/ paymentcode should not throw

          if ( oldContact != null && paymentCodeValue.equals(oldContact.getPaymentCode()) ) {
            throw new RuntimeException("Cannot add same business");
          }

          PaymentCode paymentCode = (PaymentCode) paymentCodeDAO.find(paymentCodeValue);
          if ( paymentCode == null ) {
            throw new RuntimeException("Invalid payment code. Please try again.");
          }

          Business business = (Business) businessDAO.find(paymentCode.getOwner());
          if ( business == null || ((Long) business.getId()).equals(loggedInBusiness.getId())) {
            throw new RuntimeException("Invalid payment code. Please try again.");
          }

          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
              contact.setOrganization(business.getOrganization());
              contact.setBusinessId(business.getId());
              //Overwrite email, will need refactor with upcoming changes
              contact.setEmail(business.getEmail());
            }
          }, "upgrade contact");
        `
      }
    ]
});
