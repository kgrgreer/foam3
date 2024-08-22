/**
 * @license
 * Copyright 2016 Google Inc. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.dao',
  name: 'Sink',

  documentation: 'Interface for receiving information updates. Primarily used as the target for DAO.select() calls.',

  methods: [
    {
      name: 'put',
      args: [
        {
          name: 'obj',
          type: 'Any'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ]
    },
    {
      name: 'remove',
      args: [
        {
          name: 'obj',
          type: 'Any'
        },
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ]
    },
    {
      name: 'eof'
    },
    {
      name: 'reset',
      args: [
        {
          name: 'sub',
          type: 'foam.core.Detachable'
        }
      ]
    }
  ]
});
