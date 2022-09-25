/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.dao',
  name: 'FileRollCmd',
  documentation: `
    Command sent to trigger the receiving file layer to start reading/writing to a new file.
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'rolled'
    },
    {
      class: 'String',
      name: 'rolledFilename'
    },
    {
      class: 'String',
      name: 'error'
    }
  ]
});
