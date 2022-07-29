/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'SessionCrunchCache',

  javaImports: [
    'foam.core.X',
    'foam.core.Detachable',
    'foam.dao.AbstractSink',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'java.util.ArrayList',
    'java.util.Arrays',
    'java.util.HashMap',
    'java.util.List',
    'java.util.Map',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Long',
      name: 'sequenceId'
    },
    {
      class: 'Object',
      javaType: 'Map<String, List<String>>',
      name: 'prerequisitesCache',
      javaFactory: 'return new HashMap<String, List<String>>();'
    },
    {
      class: 'Object',
      javaType: 'Map<String, List<String>>',
      name: 'dependentsCache',
      javaFactory: 'return new HashMap<String, List<String>>();'
    }
  ],

  methods: [
    // ???: Add getPrereqs and getDependents methods in here?
    {
      name: 'getPrerequisites',
      synchronized: true,
      type: 'List<String>',
      args: [
        { type: 'Context', name: 'x' },
        { javaType: 'long',  name: 'sequenceId' },
        { type: 'String',  name: 'capabilityId' }
      ],
      javaCode: `
        maybeInvalidate(sequenceId);
        
        // Cache hit
        var cacheResults = getPrerequisitesCache().get(capabilityId);
        if ( cacheResults != null ) return cacheResults;

        // Cache miss...
        var results = new ArrayList<String>();

        var dao = ((DAO) x.get("prerequisiteCapabilityJunctionDAO")).inX(x);
        dao
          .where(EQ(CapabilityCapabilityJunction.SOURCE_ID, capabilityId))
          .select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              results.add(((CapabilityCapabilityJunction) obj).getTargetId());
            }
          });

        getPrerequisitesCache().put(capabilityId, results);

        return results;
      `
    },
    {
      name: 'getDependents',
      synchronized: true,
      type: 'List<String>',
      args: [
        { type: 'Context', name: 'x' },
        { javaType: 'long',  name: 'sequenceId' },
        { type: 'String',  name: 'capabilityId' }
      ],
      javaCode: `
        maybeInvalidate(sequenceId);
        
        // Cache hit
        var cacheResults = getDependentsCache().get(capabilityId);
        if ( cacheResults != null ) return cacheResults;

        // Cache miss...
        var results = new ArrayList<String>();

        var dao = ((DAO) x.get("prerequisiteCapabilityJunctionDAO")).inX(x);
        dao
          .where(EQ(CapabilityCapabilityJunction.TARGET_ID, capabilityId))
          .select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              results.add(((CapabilityCapabilityJunction) obj).getSourceId());
            }
          });

        getDependentsCache().put(capabilityId, results);

        return results;
      `
    },
    {
      name: 'maybeInvalidate',
      synchronized: true,
      args: [
        { javaType: 'long', name: 'sequenceId' }
      ],
      javaCode: `
        if ( sequenceId == getSequenceId() ) return;

        getPrerequisitesCache().clear();
        getDependentsCache().clear();
        setSequenceId(sequenceId);
      `
    }
  ]
});
