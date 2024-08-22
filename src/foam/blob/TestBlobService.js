/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.blob',
  name: 'TestBlobService',
  extends: 'foam.blob.AbstractBlobService',

  flags: [],

  requires: [
    'foam.blob.IdentifiedBlob',
    'foam.blob.BlobBlob'
  ],

  properties: [
    {
      class: 'Map',
      name: 'blobs'
    },
    {
      class: 'Int',
      name: 'nextId',
      value: 1
    }
  ],

  methods: [
    function put_(x, file) {
      var id = this.nextId++;
      this.blobs[id] = file;
      return Promise.resolve(this.IdentifiedBlob.create({ id: id }));
    },

    function find_(x, id) {
      return Promise.resolve(this.blobs[id] ?
        this.BlobBlob.create({ blob: this.blobs[id] }) :
        null);
    },

    function urlFor_(x, blob) {
      if ( this.IdentifiedBlob.isInstance(blob) ) {
        return URL.createObjectURL(this.blobs[blob.id]);
      }
      if ( this.BlobBlob.isInstance(blob) ) {
        return URL.createObjectURL(blob.blob);
      }

      return null;
    }
  ]
});
