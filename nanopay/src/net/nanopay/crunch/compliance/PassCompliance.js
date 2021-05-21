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
  name: 'PassCompliance',
  implements: [
    'foam.nanos.ruler.RuleAction'
  ],

  documentation: `Updates user compliance to approved for testing purposes.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.nanos.crunch.UserCapabilityJunction',
    'java.util.Calendar',
    'java.util.TimeZone',
    'net.nanopay.admin.model.ComplianceStatus',
    'net.nanopay.meter.compliance.ComplianceValidationStatus'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
            DAO userDAO = (DAO) x.get("localUserDAO");
            User user = (User) userDAO.find(ucj.getSourceId()).fclone();
            user.setCompliance(ComplianceStatus.PASSED);
            if ( user.getDateCompliancePassed() == null ) {
              user.setDateCompliancePassed(Calendar.getInstance(TimeZone.getTimeZone("UTC")).getTime());
            }
            userDAO.put(user);
          }
        }, "Pass Compliance");

        ruler.putResult(ComplianceValidationStatus.VALIDATED);
      `
    }
  ]
});
