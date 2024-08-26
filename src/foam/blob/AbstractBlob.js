/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.blob',
  name: 'AbstractBlob',
  abstract: true,

  implements: [ 'foam.blob.Blob' ],

  methods: [
    {
      name: 'slice',
      type: 'foam.blob.Blob',
      args: [ { name: 'offset', type: 'Long' },
              { name: 'length', type: 'Long' } ],
      code: function slice(offset, length) {
        return foam.blob.SubBlob.create({
          parent: this,
          offset: offset,
          size: length
        });
      },
      javaCode: 'return new SubBlob.Builder(getX()).setParent(this).setOffset(offset).setSize(length).build();'
    }
  ]
});
