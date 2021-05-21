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
  package: 'net.nanopay.auth',
  name: 'BusinessEmployeeDAO',
  extends: 'foam.dao.ReadOnlyDAO',
  flags: ['java'],

  documentation: `
    DAO decorator that filters out all the users
    not associated with the current user
  `,

  javaImports: [
    'foam.core.Detachable',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.ProxySink',
    'foam.dao.Sink',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.UserUserJunction',

    'net.nanopay.model.Business',
    'static foam.mlang.MLang.*'
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
        Sink s = sink != null ? sink : new ArraySink();
        ProxySink proxy = new ProxySink(x, s) {
          public void put(Object o, Detachable d) {
            User user = (User) o;
            if ( isEmployee(x, user) ) {
              getDelegate().put(user, d);
            }
          }
        };

        getDelegate().select_(x, proxy, skip, limit, order, predicate);

        return proxy.getDelegate();
      `
    },
    {
      name: 'isEmployee',
      type: 'Boolean',
      args: [
        { name: 'x', type: 'Context' },
        { name: 'user', type: 'foam.nanos.auth.User' }
      ],
      javaCode: `
        if (user == null) return false;

        User business = (Business) ((Subject) x.get("subject")).getUser();
        DAO agentJunctionDAO = (DAO) x.get("agentJunctionDAO");
        UserUserJunction junction = (UserUserJunction) agentJunctionDAO.find(
          AND(
            EQ(UserUserJunction.SOURCE_ID, user.getId()),
            EQ(UserUserJunction.TARGET_ID, business.getId())
          )
        );
        return junction != null;
      `
    }
  ]
});
