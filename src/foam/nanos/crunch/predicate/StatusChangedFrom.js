/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch.predicate',
  name: 'StatusChangedFrom',
  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  javaImports: [
    'foam.core.X',
    'foam.dao.DAO',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.nanos.crunch.CrunchService',
    'foam.nanos.crunch.UserCapabilityJunction',
    'static foam.nanos.crunch.CapabilityJunctionStatus.*',
  ],

  properties: [
    {
      name: 'status',
      class: 'Enum',
      of: 'foam.nanos.crunch.CapabilityJunctionStatus'
    },
    {
      name: 'checkInequality',
      documentation: 'Checks if status changed',
      class: 'Boolean',
      value: true
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        var x = (X) obj;

        UserCapabilityJunction oldUCJ = (UserCapabilityJunction) x.get("OLD");
        UserCapabilityJunction newUCJ = (UserCapabilityJunction) x.get("NEW");

        CapabilityJunctionStatus oldStatus = oldUCJ == null ?
          CapabilityJunctionStatus.AVAILABLE : oldUCJ.getStatus();
        
        CapabilityJunctionStatus newStatus = newUCJ == null ?
          CapabilityJunctionStatus.AVAILABLE : newUCJ.getStatus();
        
        if ( getCheckInequality() ) {
          if ( oldStatus == newStatus ) return false;
        }

        return oldStatus == getStatus();
      `
    }
  ],
});
