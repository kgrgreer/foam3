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
      name: 'prerequisiteStringsCache',
      javaFactory: 'return new HashMap<String, List<String>>();'
    },
    {
      class: 'Object',
      javaType: 'Map<String, List<Capability>>',
      name: 'prerequisiteObjectsCache',
      javaFactory: 'return new HashMap<String, List<Capability>>();'
    },
    {
      class: 'Object',
      javaType: 'Map<String, String[]>',
      name: 'dependentsCache',
      javaFactory: 'return new HashMap<String, String[]>();'
    }
  ],

  methods: [
    // ???: Add getPrereqs and getDependents methods in here?
    {
      name: 'maybeCachePrerequisites',
      synchronized: true,
      args: [
        { type: 'Context',  name: 'x' },
        { javaType: 'long', name: 'sequenceId' },
        { type: 'String',   name: 'capabilityId' }
      ],
      javaCode: `
        maybeInvalidate(sequenceId);

        // Cache hit
        var cacheResults = getPrerequisiteStringsCache().get(capabilityId);
        if ( cacheResults != null ) return;

        // Cache miss...
        var stringResults = new ArrayList<String>();
        var objectResults = new ArrayList<Capability>();

        var dao = ((DAO) x.get("prerequisiteCapabilityJunctionDAO")).inX(x);
        dao
          .where(EQ(CapabilityCapabilityJunction.SOURCE_ID, capabilityId))
          .select(new AbstractSink() {
            @Override
            public void put(Object obj, Detachable sub) {
              var id = ((CapabilityCapabilityJunction) obj).getTargetId();
              var capabilityDAO = (DAO) x.get("capabilityDAO");
              var cap = (Capability) capabilityDAO.find(id);
              stringResults.add(id);
              if ( cap == null ) return;
              objectResults.add((Capability) capabilityDAO.find(id));
            }
          });

        getPrerequisiteStringsCache().put(capabilityId, stringResults);
        getPrerequisiteObjectsCache().put(capabilityId, objectResults);

        return;
      `
    },
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
        maybeCachePrerequisites(x, sequenceId, capabilityId);
        return getPrerequisiteStringsCache().get(capabilityId);
      `
    },
    {
      name: 'getPrerequisiteObjects',
      synchronized: true,
      type: 'List<Capability>',
      args: [
        { type: 'Context',  name: 'x' },
        { javaType: 'long', name: 'sequenceId' },
        { type: 'String',   name: 'capabilityId' }
      ],
      javaCode: `
        maybeCachePrerequisites(x, sequenceId, capabilityId);
        return getPrerequisiteObjectsCache().get(capabilityId);
      `
    },
    {
      name: 'getDependents',
      synchronized: true,
      type: 'String[]',
      args: [
        { type: 'Context',  name: 'x' },
        { javaType: 'long', name: 'sequenceId' },
        { type: 'String',   name: 'capabilityId' }
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

        var asArray = results.toArray(new String[0]);

        getDependentsCache().put(capabilityId, asArray);

        return asArray;
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

        getPrerequisiteStringsCache().clear();
        getPrerequisiteObjectsCache().clear();
        getDependentsCache().clear();
        setSequenceId(sequenceId);
      `
    }
  ]
});
