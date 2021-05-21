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
  package: 'net.nanopay.partner.treviso',
  name: 'FepWebUserUpdatingRule',
  implements: ['foam.nanos.ruler.RuleAction'],

  documentation: `Update the user information to FepWeb when it is changed by Treviso agents.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'foam.nanos.auth.User',
    'net.nanopay.partner.treviso.TrevisoService'
  ],

   methods: [
    {
      name: 'applyAction',
      javaCode: `
        agency.submit(x, new ContextAgent() {
          @Override
          public void execute(X x) {
            User user = (User) obj;
            TrevisoService trevisoService = (TrevisoService) x.get("trevisoService");
            trevisoService.updateEntity(x, user.getId());
          }
        }, "Update user information to FepWeb when address and name has been changed");
      `
    }
  ]
});
