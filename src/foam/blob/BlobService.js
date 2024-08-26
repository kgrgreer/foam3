/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.INTERFACE({
  package: 'foam.blob',
  name: 'BlobService',

  documentation: 'BlobService Interface',

  methods: [
    {
      name: 'put',
      async: true,
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'put_',
      async: 'true',
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'find',
      async: true,
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'id',
          type: 'Any'
        }
      ]
    },
    {
      name: 'find_',
      async: true,
      type: 'foam.blob.Blob',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'id',
          type: 'Any'
        }
      ]
    },
    {
      name: 'urlFor',
      type: 'String',
      args: [
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    },
    {
      name: 'urlFor_',
      type: 'String',
      args: [
        {
          name: 'x',
          type: 'Context'
        },
        {
          name: 'blob',
          type: 'foam.blob.Blob'
        }
      ]
    }
  ]
});
