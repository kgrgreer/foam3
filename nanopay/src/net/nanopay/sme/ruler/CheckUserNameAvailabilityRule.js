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
    package: 'net.nanopay.sme.ruler',
    name: 'CheckUserNameAvailabilityRule',
    extends: 'foam.dao.ProxyDAO',

    documentation: ` A rule that checks if a user with the same username already
      exists in the system.`,

    implements: ['foam.nanos.ruler.RuleAction'],

    javaImports: [
      'foam.core.ContextAgent',
      'foam.core.X',
      'foam.dao.DAO',
      'foam.nanos.auth.User',
      'static foam.mlang.MLang.*'
    ],

    methods: [
      {
        name: 'applyAction',
        javaCode: `

          User user = (User) obj;
          DAO userDAO = (DAO) x.get("localUserDAO");
          User userWithRequestedUserName = (User) userDAO.find(EQ(User.USER_NAME, user.getUserName()));
          if ( userWithRequestedUserName != null ) {
            throw new RuntimeException("User with the same username already exists: " + user.getUserName());
          }

          agency.submit(x, new ContextAgent() {
            @Override
            public void execute(X x) {
            }
          }, "available username");
        `
      }
    ]
});
