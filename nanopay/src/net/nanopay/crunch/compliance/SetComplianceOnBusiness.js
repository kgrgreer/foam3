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
  package: 'net.nanopay.crunch.compliance',
  name: 'SetComplianceOnBusiness',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `For legacy system integration we need to set some properties to User objects.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.AgentCapabilityJunction',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.lang.UnsupportedOperationException',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.model.Business'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          private final X systemX = ruler.getX();
          @Override
          public void execute(X x) {
            DAO userDAO = ((DAO) x.get("localUserDAO")).inX(systemX);
            Long id = obj instanceof AgentCapabilityJunction ? ((AgentCapabilityJunction) obj).getEffectiveUser() : ((UserCapabilityJunction) obj).getSourceId();
            User user = (User) userDAO.find(id);
            try {
              Business business = (Business) user.fclone();
              business.setCompliance(ComplianceStatus.PASSED); // for access into the invoicing
              business.setOnboarded(true); // for afex business create
              userDAO.put(business);
            } catch(Exception e) {
              throw new UnsupportedOperationException("Business : " + user.getId() + " compliance not set - but UCJ granted" + "Error: " + e);
            }
          }
        }, "Business Compliance Set");
      `
    }
  ]
});
