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
  package: 'net.nanopay.admin',
  name: 'AccountStatusUserDAO',
  extends: 'foam.dao.ProxyDAO',
  documentation: `
    This DAO decorator updates the previousStatus property on the user model
    to be equal to the user's old status whenever the status property is updated
  `,

  javaImports: [
    'foam.core.FObject',
    'foam.core.PropertyInfo',
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.User',
    'foam.util.SafetyUtil'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function(cls) {
        cls.extras.push(`
          public AccountStatusUserDAO(X x, DAO delegate) {
            super(x, delegate);
          }   
        `
        );
      }
    }
  ],

  methods: [
    {
      name: 'put_',
      javaCode: `
        User newUser = (User) obj;
        User oldUser = (User) getDelegate().find(newUser.getId());
        PropertyInfo prop = (PropertyInfo) User.getOwnClassInfo().getAxiomByName("status");

        // If new status and old status are different then set previous status
        if ( oldUser != null && ! SafetyUtil.equals(prop.get(newUser), prop.get(oldUser)) ) {
          newUser.setPreviousStatus(oldUser.getStatus());
        }

        return super.put_(x, obj);
      `
    }
  ]
});

