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
    'java.util.Map',
    'java.util.List',
    'java.util.concurrent.ConcurrentHashMap',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'Object',
      javaType: 'Map<String, Integer>',
      name: 'prerequisitesSeqId',
      javaFactory: 'return new ConcurrentHashMap<String, Integer>();'
    },
    {
      class: 'Object',
      javaType: 'Map<String, Integer>',
      name: 'dependentsSeqId',
      javaFactory: 'return new ConcurrentHashMap<String, Integer>();'
    },
    {
      class: 'Object',
      javaType: 'Map<String, List<String>>',
      name: 'prerequisites',
      javaFactory: 'return new ConcurrentHashMap<String, List<String>>();'
    },
    {
      class: 'Object',
      javaType: 'Map<String, List<String>>',
      name: 'dependents',
      javaFactory: 'return new ConcurrentHashMap<String, List<String>>();'
    }
  ],

  methods: [
    // ???: Add getPrereqs and getDependents methods in here?
    {
      name: 'getPrerequisites',
      type: 'List<String>',
      args: [
        { type: 'Context', name: 'x' },
        { javaType: 'int',  name: 'sequenceId' },
        { type: 'String',  name: 'capabilityId' }
      ],
      javaCode: `
        var seqId = getPrerequisitesSeqId().get(capabilityId);
        
        // Cache hit condition
        if ( seqId != null && seqId == sequenceId ) {
          return getPrerequisites().get(capabilityId);
        }
        // Everything following handles a cache miss

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

        getPrerequisites().put(capabilityId, results);
        getPrerequisitesSeqId().put(capabilityId, sequenceId);

        return results;
      `
    },
    {
      name: 'getDependents',
      type: 'List<String>',
      args: [
        { type: 'Context', name: 'x' },
        { javaType: 'int',  name: 'sequenceId' },
        { type: 'String',  name: 'capabilityId' }
      ],
      javaCode: `
        var seqId = getDependentsSeqId().get(capabilityId);
        
        // Cache hit condition
        if ( seqId != null && seqId == sequenceId ) {
          return getDependents().get(capabilityId);
        }
        // Everything following handles a cache miss

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

        getPrerequisites().put(capabilityId, results);
        getPrerequisitesSeqId().put(capabilityId, sequenceId);

        return results;
      `
    }
  ]
});
