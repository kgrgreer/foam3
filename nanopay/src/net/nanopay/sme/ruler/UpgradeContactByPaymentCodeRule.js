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
      'net.nanopay.model.Business',
      'net.nanopay.contacts.Contact',
      'static foam.mlang.MLang.*'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `

          // if ( true ) throw new RuntimeException("error");

          // [UPDATE]
          // 1) check if update (oldObj != null)
          // 2) check oldObj.getPaymentCode == ""
          // 3) check obj.getPaymentCode != ""

          // if newObj.getPaymentCode != oldObj.getPaymentCode => swap

          // [CREATE]
          // TODO: figure out if same rule can be aplied for CPF-3829

          Contact newContact = (Contact) obj;
          Contact oldContact = (Contact) oldObj;
          if ( ! oldContact.getPaymentCode.equals("") || newContact.getPaymentCode).equals("") || new) {
            throw new RuntimeException("Cannot upgrade contact ");
          }

          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {

            }
          }, "upgrade contact");
        `
      }
    ]
});
