/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.bank.ruler',
  name: 'ExternalGrantBRBankAccountCapabilityRule',

  documentation: 'Grant BRBankAccountCapability when BRBankAccount is created outside of Brazilian onboarding.',

  implements: ['foam.nanos.ruler.RuleAction'],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.util.SafetyUtil',

    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {

          User user = ((Subject) x.get("subject")).getUser();

          if ( user == null || ! ( user instanceof Business ) ) return;

          DAO ucjDAO = (DAO) (x.get("userCapabilityJunctionDAO"));

          // lookup BRBankAccountCapability ucj entry
          UserCapabilityJunction ucj = (UserCapabilityJunction) ucjDAO.find(
            AND(
              EQ(UserCapabilityJunction.TARGET_ID, "7b41a164-29bd-11eb-adc1-0242ac120002"),
              EQ(UserCapabilityJunction.SOURCE_ID, user.getId())
            )
          );

          if ( ucj == null ) {
            ucj = new UserCapabilityJunction.Builder(x).setSourceId(user.getId()).setTargetId("7b41a164-29bd-11eb-adc1-0242ac120002").build();
            ucj.setStatus(CapabilityJunctionStatus.GRANTED);
            ucjDAO.put_(x, ucj);
          }
          if ( ucj.getStatus() !=  CapabilityJunctionStatus.GRANTED ) {
            ucj = (UserCapabilityJunction) ucj.fclone();
            ucj.setStatus(CapabilityJunctionStatus.GRANTED);
            ucjDAO.put_(x, ucj);
          }
         }
        }, "Grant BRBankAccountCapability on external BRBankAccount creation");
      `
    }
  ]
});
