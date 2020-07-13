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
  package: 'net.nanopay.liquidity.ruler',
  name: 'LogoutUserOnAssignmentAction',
  extends: 'net.nanopay.auth.ruler.LogoutUserAction',

  documentation: `This rule action logs out users after an assignment.`,

  javaImports: [
    'foam.core.ContextAgent',
    'foam.core.X',
    'net.nanopay.liquidity.crunch.RoleAssignment'
  ],

  methods: [
    {
      name: 'applyAction',
      javaCode: `
      RoleAssignment request = (RoleAssignment) obj;
      
      // Check if there are users
      if (request.getUsers().size() <= 0) {
        return;
      }
      
      // Update the amount spent in the limit state
      agency.submit(x, new ContextAgent() {
        @Override
        public void execute(X x) {
          // Logout all users in the request
          for (long userId : request.getUsers()) {
            if ( userId != 0 )
              logoutUser(x, userId);
          }
        }
      },
      "Invalidating sessions for user in capability request " + request.getId() + ".");
      `
    }
  ]
});

