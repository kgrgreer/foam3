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
