/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.blob',
  name: 'SubBlob',
  extends: 'foam.blob.AbstractBlob',

  properties: [
    {
      class: 'Blob',
      name: 'parent',
    },
    {
      class: 'Long',
      name: 'offset'
    },
    {
      class: 'Long',
      name: 'size',
      assertValue: function(value) {
        foam.assert(this.offset + value <= this.parent.size, 'Cannot create sub blob beyond end of parent.');
      }
    }
  ],

  methods: [
    {
      name: 'read',
      code: function read(buffer, offset) {
        if ( buffer.length > this.size - offset) {
          buffer = buffer.slice(0, this.size - offset);
        }

        return this.parent.read(buffer, offset + this.offset);
      },
      javaCode: `length = Math.min(length, getSize() - offset);
return getParent().read(out, offset, length);`
    },
    {
      name: 'slice',
      code: function slice(offset, length) {
        return foam.blob.SubBlob.create({
          parent: this.parent,
          offset: this.offset + offset,
          size: length
        });
      },
      javaCode: 'return new SubBlob(getParent(), getOffset() + offset, length);'
    }
  ]
});
