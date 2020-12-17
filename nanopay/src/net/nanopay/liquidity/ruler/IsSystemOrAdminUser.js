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
  name: 'IsSystemOrAdminUser',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: 'Returns true if the current user is a system or admin user.',

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        User user = ((Subject) ((X) obj).get("subject")).getUser();
        return user != null
          && ( user.getId() == User.SYSTEM_USER_ID
            || user.getGroup().equals("admin")
            || user.getGroup().equals("system") );
      `
    }
  ]
});
