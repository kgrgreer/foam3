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
  package: 'net.nanopay.meter',
  name: 'ReadDisabledUserDAO',
  extends: 'foam.dao.ProxyDAO',

  // NOTE: Disabled user should have `status=DISABLED`. User who has `enabled=false` is instead considered as deleted.
  //       This might change when DeletedAware is implemented.
  documentation: 'Filter out disabled user.',

  javaImports: [
    'foam.core.FObject',
    'foam.dao.ProxySink',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.User',
    'net.nanopay.admin.model.AccountStatus',
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        return read(x, super.find_(x, id));
      `
    },
    {
      name: 'select_',
      javaCode: `
        if (sink != null) {
          ProxySink decoratedSink = new ProxySink(x, sink) {
            @Override
            public void put(Object obj, foam.core.Detachable sub) {
              FObject result = read(getX(), (FObject) obj);
              if ( result != null ) {
                super.put(result, sub);
              }
            }
          };
          super.select_(x, decoratedSink, skip, limit, order, predicate);
          return sink;
        }
        return super.select_(x, sink, skip, limit, order, predicate);
      `
    },
    {
      name: 'read',
      type: 'foam.nanos.auth.User',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'foam.core.FObject', name: 'obj' }
      ],
      javaCode: `
        User result = (User) obj;
        AuthService auth = (AuthService) x.get("auth");

        if ( result != null
          && result.getStatus().equals(AccountStatus.DISABLED)
          && ! auth.check(x, "user.read.disabled")
        ) {
          return null;
        }
        return result;
      `
    }
  ]
});
