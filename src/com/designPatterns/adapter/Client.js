/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'com.designPatterns.adapter',
  name: 'Client',

  properties: [
    {
      of: 'com.designPatterns.adapter.ITarget',
      name: 'target',
    }
  ]
});
