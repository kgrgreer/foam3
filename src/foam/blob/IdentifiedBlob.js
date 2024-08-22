/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.blob',
  name: 'IdentifiedBlob',
  extends: 'foam.blob.ProxyBlob',

  imports: [
    'BlobStore blobStore?',
    'blobService'
  ],

  properties: [
    {
      class: 'String',
      name: 'id'
    },
    {
      name: 'delegate',
      transient: true,
      factory: function() {
        return this.blobService.find(this.id);
      },
      javaFactory: `
        return ((BlobService) getBlobStore()).find(getId());
      `,
      cloneProperty: function () {},
      diffProperty: function () {},
      javaCloneProperty: '// noop',
      javaDiffProperty: '// noop',
      javaCompare: 'return 0;',
      javaComparePropertyToObject: 'return 0;',
      javaComparePropertyToValue: 'return 0;',
    }
  ],

  methods: [
    function read(buffer, offset) {
      return this.delegate.then(function(d) {
        return d.read(buffer, offset);
      });
    },

    {
      name: 'compareTo',
      type: 'int',
      args:
        [
          {
            name: 'o',
            type: 'Object',
          }
        ],
      javaCode: `
        IdentifiedBlob o2 = (IdentifiedBlob) o;
        if ( o2 == null ) return 1;
        if ( o2 == this ) return 0;
        return foam.util.SafetyUtil.compare(getId(), o2.getId());
      `,
      code: function(other) {
        if ( other === null ) return 1;
        return this.id.localeCompare(other.id);
      },
    },
  ]
});
