foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'AbstractISOPackager',
  abstract: true,

  implements: [
    'net.nanopay.iso8583.ISOPackager'
  ],

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.iso8583.ISOFieldPackager',
      name: 'fields'
    }
  ],

  methods: [
    {
      name: 'emitBitMap',
      javaReturns: 'boolean',
      javaCode: `
        return getFields().length > 1 && getFields()[1] instanceof ISOBitMapFieldPackager;
      `
    },
    {
      name: 'getFirstField',
      javaReturns: 'int',
      javaCode: `
        return getFields().length > 1 ? getFields()[1] instanceof ISOBitMapFieldPackager ? 2 : 1 : 0;
      `
    },
    {
      name: 'pack',
      javaCode: `
        int first = getFirstField();
        java.util.Map fields = m.getChildren();
        ISOComponent c = (ISOComponent) fields.get(0);

        // pack MTI
        if ( first > 0 && c != null ) {
          getFields()[0].pack(c, out);
        }

        // pack bitmap
        if ( emitBitMap() ) {
          // get bitmap field and pack
          c = (ISOComponent) fields.get(-1);
          getBitMapFieldPackager().pack(c, out);
        }

        // pack fields
        int maxField = Math.min(m.getMaxField(), 128);
        for ( int i = first ; i <= maxField ; i++ ) {
          if ( ( c = (ISOComponent) fields.get(i)) == null ) {
            continue;
          }

          ISOFieldPackager fp = getFields()[i];
          if ( fp == null ) {
            throw new IllegalStateException("Null field " + i + " packager");
          }

          fp.pack(c, out);
        }
      `
    },
    {
      name: 'unpack',
      javaCode: `
        return 0;
      `
    },
    {
      name: 'getFieldPackager',
      javaReturns: 'net.nanopay.iso8583.ISOFieldPackager',
      args: [
        {
          name: 'field',
          javaType: 'int',
        }
      ],
      javaCode: `
        return getFields() != null && field < getFields().length ? getFields()[field] : null;
      `
    },
    {
      name: 'getBitMapFieldPackager',
      javaReturns: 'net.nanopay.iso8583.ISOFieldPackager',
      javaCode: `
        return getFields()[1];
      `
    }
  ]
});
