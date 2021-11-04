/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.INTERFACE({
  package: 'foam.nanos.auth',
  name: 'LastModifiedByAgentNameAware',
  properties: [
    {
      class: 'String',
      name: 'lastModifiedByAgentName',
      createVisibility: 'HIDDEN',
      updateVisibility: 'RO',
      documentation: 'The name of the agent acting as User who last modified entry',
      storageOptional: true
    }
  ]
});