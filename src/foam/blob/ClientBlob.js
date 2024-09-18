/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.blob',
  name: 'ClientBlob',
  extends: 'foam.blob.AbstractBlob',

  properties: [
    {
      class: 'Stub',
      of: 'foam.blob.Blob',
      name: 'delegate',
      methods: [ 'read' ]
    },
    {
      class: 'Long',
      name: 'size'
    }
  ],

  methods: [
    function getSize() { return this.size; }
  ]
});
