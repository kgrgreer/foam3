/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'CapabilityDataUpdated',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `Returns true if the data of capability was updated`,

  javaImports: [
    'foam.core.X',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        var x = (X) obj;

        UserCapabilityJunction oldUCJ = (UserCapabilityJunction) x.get("OLD");
        UserCapabilityJunction newUCJ = (UserCapabilityJunction) x.get("NEW");

        if ( oldUCJ == null )
          return true;

        return oldUCJ.getData().compareTo(newUCJ.getData()) != 0;
      `
    }
  ]
});
