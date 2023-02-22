/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.mlang.predicate',
  name: 'CapabilityAuthServicePredicate',
  extends: 'foam.mlang.predicate.AbstractPredicate',

  documentation: `
    The main reason to create this modeled predicate is to solve a performance
    issue. We need to avoid using anonymous inner class.
    By creating a model, we will be able to have better concurrency performance.
  `,

  javaImports: [
    'foam.nanos.auth.ServiceProvider',
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger'
  ],

  properties: [
    {
      name: 'capabilityDAO',
      class: 'FObjectProperty',
      of: 'foam.dao.DAO'
    },
    {
      name: 'permission',
      class: 'String'
    },
    {
      name: 'entity',
      class: 'Enum',
      of: 'foam.nanos.crunch.AssociatedEntity'
    }
  ],

  methods: [
    {
      name: 'f',
      args: 'Object obj',
      javaCode: `
          foam.core.X x = getX();
          UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
          if ( ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) {
            Capability c = (Capability) getCapabilityDAO().find(ucj.getTargetId());
            if ( c != null && ( getEntity() == null || c.getAssociatedEntity().equals(getEntity()) ) && ! c.isDeprecated(x) ) {
              // only set context - which is system - to spid caps - for prerequisiteImplies
              if ( c.grantsPermission(x, getPermission()) ) return true;
            } else if ( c == null ) {
              Logger logger = (Logger) getX().get("logger");
              logger.warning(this.getClass().getSimpleName(), "capabilityCheck", "targetId not found", ucj);
            }
          }
          return false;
      `
    },
    {
      name: 'fclone',
      type: 'FObject',
      javaCode: 'return this;'
    }
  ]
});
