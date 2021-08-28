/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'IsUserServiceProviderJunction',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  documentation: `
    A predicate to check whether the target Capability in an UserCapabilityJunction
    is a ServiceProvider capability.
  `,

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.UserCapabilityJunction'
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        var x = (X) obj;

        UserCapabilityJunction ucj = (UserCapabilityJunction) x.get("NEW");
        Capability capability = (Capability) ((DAO) x.get("localCapabilityDAO")).find(ucj.getTargetId());

        return capability != null && capability instanceof foam.nanos.auth.ServiceProvider;
      `
    }
  ],
});
