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
        byte[] b;
        int len = 0;
        java.util.List<byte[]> v = new java.util.ArrayList<byte[]>(128);

        java.util.Map fields = m.getChildren();
        ISOComponent c = (ISOComponent) fields.get(0);

        for ( int i = getFirstField() ; i <= Math.min(m.getMaxField(), 128) ; i++ ) {
          if ( ( c = (ISOComponent) fields.get(i)) == null ) {
            continue;
          }

          ISOFieldPackager fp = getFields()[i];
          if ( fp == null ) {
            // TODO: throw exception
            continue;
          }

          b = fp.pack(c);
          len += b.length;
          v.add(b);
        }

        int k = 0;
        byte[] d = new byte[len];
        for ( byte[] bb : v ) {
          System.arraycopy(bb, 0, d, k, bb.length);
          k += bb.length;
        }

        return d;
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
    }
  ]
});
