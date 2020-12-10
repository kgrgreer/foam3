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
  package: 'net.nanopay.crunch.onboardingModels',
  name: 'SigningOfficerPersonalDataOnPut',
  extends: 'net.nanopay.meter.compliance.AbstractComplianceRuleAction',

  implements: [ 'foam.nanos.ruler.RuleAction' ],

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'net.nanopay.model.BusinessUserJunction',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            UserCapabilityJunction old = (UserCapabilityJunction) oldObj;
    
            if ( ucj.getStatus() != CapabilityJunctionStatus.GRANTED || ( old != null && old.getStatus() == CapabilityJunctionStatus.GRANTED ) ) return;

            User business = ((Subject) x.get("subject")).getUser();
            User user = ((Subject) x.get("subject")).getRealUser();
            if ( business == null || user == null ) throw new RuntimeException("business or user cannot be found");

            addSigningOfficer(x, user, business);
          }
        }, "On SigningOfficerPersonalData completion, add the current agent as signing officer.");
      `
    },
    {
      name: 'addSigningOfficer',
      args: [
        { name: 'x', javaType: 'foam.core.X' },
        { name: 'user', javaType: 'foam.nanos.auth.User' },
        { name: 'business', javaType: 'foam.nanos.auth.User' }
      ],
      javaCode: `            
        DAO signingOfficerJunctionDAO = (DAO) x.get("signingOfficerJunctionDAO");

        signingOfficerJunctionDAO.put_(x, new BusinessUserJunction.Builder(x)
          .setSourceId(business.getId())
          .setTargetId(user.getId())
          .build());
      `
    }
  ]
});
