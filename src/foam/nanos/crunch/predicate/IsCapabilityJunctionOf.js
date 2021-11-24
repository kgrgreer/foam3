/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'IsCapabilityJunctionOf',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `Returns true if the ucj object of a specific capability and user class`,

  javaImports: [
    'foam.core.X',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  properties: [
    {
      class: 'String',
      name: 'capabilityId'
    },
    {
      class: 'Class',
      name: 'of',
      documentation: 'Expected class of the ucj.source_id reference. Eg. foam.nanos.auth.User'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        X x = (X) obj;
        var ucj = (UserCapabilityJunction) x.get("NEW");
        return ucj.getTargetId().equals(getCapabilityId())
            && ucj.findSourceId(x).getClass() == getOf().getObjClass();
      `
    }
  ]
});
