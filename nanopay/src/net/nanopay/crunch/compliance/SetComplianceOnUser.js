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
  name: 'SetComplianceOnUser',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `For legacy system integration we need to set some properties to User objects.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.lang.UnsupportedOperationException',
    'net.nanopay.admin.model.ComplianceStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            DAO userDAO = (DAO) x.get("localUserDAO");

            User user = (User) userDAO.find(((UserCapabilityJunction) obj).getSourceId());
            try {
              user = (User) user.fclone();
              user.setCompliance(ComplianceStatus.PASSED);
              userDAO.put(user);
            } catch(Exception e) {
              throw new UnsupportedOperationException("User : " + user.getId() + " compliance not set - but UCJ granted" + " Errors: " + e);
            }
          }
        }, "User Compliance Set");
      `
    }
  ]
});
