/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.INTERFACE({
  package: 'foam.core',
  name: 'Agency',

  methods: [
    {
      name: 'submit',
      type: 'Void',
      args: [
        { name: 'x',           type: 'Context' },
        { name: 'agent',       type: 'foam.core.ContextAgent' },
        { name: 'description', type: 'String' }
      ]
    },
    {
      name: 'schedule',
      type: 'Void',
      args: [
        { name: 'x',           type: 'Context' },
        { name: 'agent',       type: 'foam.core.ContextAgent' },
        { name: 'key',         type: 'String' },
        { name: 'delay',       type: 'long' }
      ]
    }
  ]
});
