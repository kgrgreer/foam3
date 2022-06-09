/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'FilteredSubdomainDAO',
  extends: 'foam.dao.ProxyDAO',

  javaImports: [
    'foam.mlang.MLang',
    'foam.mlang.predicate.Predicate',
    'java.util.ArrayList',
    'javax.servlet.http.HttpServletRequest'
  ],

  properties: [
    {
      class: 'List',
      name: 'subdomains',
      javaFactory: `
        return new java.util.ArrayList();
      `
    }
  ],

  methods: [
    {
      name: 'select_',
      javaCode: `
      var list = new ArrayList<>();
      list.add(getSubdomains());
      list.add(x.get(HttpServletRequest.class).getServerName());
      var pred = new SubdomainPredicate(x, list);
      predicate = predicate == null ? pred : MLang.AND(new Predicate[] {predicate, pred});
      return super.select_(x, sink, skip, limit, order, predicate);
      `
    }
  ]
});
