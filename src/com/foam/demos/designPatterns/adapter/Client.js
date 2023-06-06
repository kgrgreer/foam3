/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'foam.demos.designPatterns.adapter',
  name: 'Client',

  properties: [
    {
      of: 'foam.demos.designPatterns.adapter.ITarget',
      name: 'target',
    }
  ]
});
