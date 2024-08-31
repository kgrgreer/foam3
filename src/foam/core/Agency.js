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
      args: 'Context x, foam.core.ContextAgent agent, String description'
    },
    {
      name: 'schedule',
      type: 'Void',
      args: 'Context x, foam.core.ContextAgent agent, String description, long delay'
    }
  ]
});
