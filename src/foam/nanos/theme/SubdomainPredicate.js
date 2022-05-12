/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.theme',
  name: 'SubdomainPredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.logger.Logger',
    'net.nanopay.ticket.RefundTicket',
    'net.nanopay.tx.model.Transaction',
    'net.nanopay.tx.SummarizingTransaction',

    'javax.servlet.http.HttpServletRequest',
    'foam.nanos.theme.SubdomainAware',
    'static foam.mlang.MLang.EQ',
    'static foam.mlang.MLang.IN',
    'static foam.mlang.MLang.NEW_OBJ'
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
      name: 'f',
      javaCode: `
      if ( ! (obj instanceof SubdomainAware) ) return false;
        return getSubdomains().contains(((SubdomainAware)obj).getSubdomain());
      `
    }
  ]
});
