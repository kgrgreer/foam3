/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.blob',
  name: 'ProxyBlobService',
  extends: 'foam.blob.AbstractBlobService',

  documentation: 'Proxy implementation for the BlobService interface',

  properties: [
    {
      class: 'Proxy',
      of: 'foam.blob.BlobService',
      name: 'delegate',
      forwards: [ 'put_', 'find_', 'urlFor_' ]
    }
  ]
});
