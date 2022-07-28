/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.crunch',
  name: 'SessionCrunchCache',

  javaImports: [
    'java.util.Map',
    'java.util.List',
    'java.util.concurrent.ConcurrentHashMap'
  ],

  properties: [
    {
      class: 'Int',
      name: 'sequenceId'
    },
    {
      class: 'Object',
      javaType: 'Map<String, List<String>>',
      name: 'prerequisites'
    },
    {
      class: 'Object',
      javaType: 'Map<String, List<String>>',
      name: 'dependants'
    }
  ],

  javaCode: `
    public SessionCrunchCache(int sequenceId) {
      setSequenceId(sequenceId);
      setPrerequisites(new ConcurrentHashMap<String, List<String>>());
      setDependants(new ConcurrentHashMap<String, List<String>>());
    }
  `,

  methods: [
    // ???: Add getPrereqs and getDependents methods in here?
  ]
});
