/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'CapabilityAvailabilityDAO',
  extends: 'foam.dao.ProxyDAO',
  flags: ['java'],

  imports: [
    'AuthService auth'
  ],

  javaImports: [
    'foam.mlang.predicate.AbstractPredicate',
    'foam.mlang.predicate.Predicate',
    'foam.nanos.auth.AuthService',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.Capability',
    'foam.nanos.theme.Theme',
    'foam.core.X',
    'foam.core.Detachable',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.dao.Sink',
    'foam.dao.ProxySink',
    
    'static foam.mlang.MLang.*'
  ],

  documentation: `
    Omit results from the capabilityDAO based on availablilityPredicate of capability.
  `,

  javaCode: `
    public CapabilityAvailabilityDAO(X x, DAO delegate) {
      setX(x);
      setDelegate(delegate);
    }
  `,

  constants: [
    {
      type: 'String',
      name: 'AVAILABILITY_PERMISSION',
      value: 'capability.availability.'
    }
  ],

  methods: [
    {
      name: 'find_',
      javaCode: `
        Theme theme = (Theme) x.get("theme");
        Capability capability = (Capability) getDelegate().find_(x, id);

        if ( capability == null || ! f(x, capability) || ( theme != null && theme.isCapabilityRestricted(capability.getId()) ) ) {
          return null;
        }
        return capability;
      `
    },
    {
      name: 'select_',
      javaCode: `
        Theme theme = (Theme) x.get("theme");
        if ( theme != null && theme.getRestrictedCapabilities() != null ) {
          return getDelegate()
            .where(NOT(IN(Capability.ID, theme.getRestrictedCapabilities())))
            .select_(x, sink, skip, limit, order, augmentPredicate(x, predicate));
        }
        return getDelegate().select_(x, sink, skip, limit, order, augmentPredicate(x, predicate));
      `
    },
    {
      name: 'augmentPredicate',
      type: 'Predicate',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Predicate', name: 'predicate' }
      ],
      javaCode: `
        return new AbstractPredicate(x) {
          @Override
          public boolean f(Object obj) {
            if ( predicate != null && ! predicate.f(obj) ) return false;
            if ( ! ( obj instanceof Capability ) ) return false;
            return CapabilityAvailabilityDAO.this.f(x, (Capability) obj);
          }
        };
      `
    },
    {
      name: 'f',
      type: 'Boolean',
      args: [
        { type: 'Context', name: 'x' },
        { type: 'Capability', name: 'capability' }
      ],
      javaCode: `
        return capability.getAvailabilityPredicate().f(x)
          || getAuth().check(x, AVAILABILITY_PERMISSION + capability.getId());
      `
    },
  ],
});
