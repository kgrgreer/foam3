/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.blob',
  name: 'AbstractBlobService',
  abstract: true,

  implements: [ 'foam.blob.BlobService' ],

  requires: [
    'foam.blob.ProxyBlobService'
  ],

  methods: [
    {
      name: 'inX',
      type: 'foam.blob.BlobService',
      args: [ { name: 'x', type: 'Context' }],
      code: function (x) {
        return this.ProxyBlobService.create({ delegate: this }, x);
      },
      javaCode: 'return new foam.blob.ProxyBlobService.Builder(x).setDelegate(this).build();'
    },
    {
      name: 'put',
      code: function put(blob) {
        return this.put_(this.__context__, blob);
      },
      javaCode: 'return this.put_(getX(), blob);'
    },
    {
      name: 'find',
      code: function find(id) {
        return this.find_(this.__context__, id);
      },
      javaCode: 'return this.find_(getX(), id);'
    },
    {
      name: 'urlFor',
      code: function urlFor(blob) {
        return this.urlFor_(this.__context__, blob);
      },
      javaCode: 'return this.urlFor_(getX(), blob);'
    }
  ]
});
