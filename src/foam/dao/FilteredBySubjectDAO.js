/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FilteredBySubjectDAO',
  extends: 'foam.dao.ProxyDAO',

  documentation: `A server side DAO which explicitly builds an EQ predicate from Subject user id and a specific object property to filter delegate DAO.
NOTE: If MQL caching and context issues are fixed on the java side, this DAO can be replaced by FileredDAO setPredicate(MQLExpr("property:me"))`,

  javaImports: [
    'foam.core.X',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.FALSE',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      class: 'Object',
      of: 'foam.core.PropertyInfo',
      name: 'propertyInfo'
    },
  ],

  javaCode: `
  public FilteredBySubjectDAO(X x, foam.core.PropertyInfo pInfo, DAO delegate) {
    super(x, delegate);
    setPropertyInfo(pInfo);
  }
  `,

  methods: [
    {
      name: 'buildPredicate',
      args: 'X x',
      type: 'foam.mlang.predicate.Predicate',
      javaCode: `
      Subject subject = (Subject) x.get("subject");
      if ( subject != null ) {
        User user = subject.getUser();
        return EQ(getPropertyInfo(), user.getId());
      } else {
        Logger logger = (Logger) x.get("logger");
        if ( logger != null ) {
          logger.warning("FilteredBySubjectDAO,Subject not found");
        } else {
          System.err.println("FilteredBySubjectDAO,Subject not found");
        }
      }
      return FALSE;
      `
    },
    {
      name: 'find_',
      javaCode: `foam.core.FObject ret = getDelegate().find_(x, id);
if ( ret != null && buildPredicate(x).f(ret) ) return ret;
return null;`
    },
    {
      name: 'select_',
      javaCode: `
      Predicate p = buildPredicate(x);
      return getDelegate().select_(x, sink, skip, limit, order, predicate == null ? p : foam.mlang.MLang.AND(p, predicate));
      `
    },
    {
      name: 'removeAll_',
      javaCode: `
      Predicate p = buildPredicate(x);
      getDelegate().removeAll_(x, skip, limit, order, predicate == null ? p : foam.mlang.MLang.AND(p, predicate));
      `
    }
  ]
})
