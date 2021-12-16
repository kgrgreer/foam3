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
    The main reason to  create this modeled predicate is to solve a performance
    issue. We need to avoid using anonymous inner class.
    By creating a model, we will be able to have a better concurrency performance.
  `,

  javaImports: [
    'foam.nanos.crunch.Capability',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.UserCapabilityJunction',
    'foam.nanos.logger.Logger',
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
    }
  ],

  methods: [
    {
      name: 'f',
      args: [
        {
          name: 'obj',
          type: 'Object'
        }
      ],
      javaCode: `
          foam.core.X x = getX();
          UserCapabilityJunction ucj = (UserCapabilityJunction) obj;
          if ( ucj.getStatus() == CapabilityJunctionStatus.GRANTED ) {
            Capability c = (Capability) getCapabilityDAO().find(ucj.getTargetId());
            if ( c != null && ! c.isDeprecated(x) ) {
              c.setX(x);
              if ( c.grantsPermission(getPermission()) ) {
               return true;
              }
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
