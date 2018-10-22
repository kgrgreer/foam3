foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOMessage',
  extends: 'net.nanopay.iso8583.AbstractISOComponent',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public void set(int field, String value) {
            if ( foam.util.SafetyUtil.isEmpty(value) ) {
              unset(field);
              return;
            }

            if ( ! ( getPackager() instanceof AbstractISOPackager ) ) {
              set(new ISOField(field, value));
            } else {
              Object obj = ((AbstractISOPackager) getPackager()).getFieldPackager(field);
              if ( obj instanceof ISOBinaryFieldPackager ) {
                set(new ISOBinaryField(field, foam.util.SecurityUtil.HexStringToByteArray(value)));
              } else {
                set(new ISOField(field, value));
              }
            }
          }

          public void set(int field, byte[] value) {
            if ( value == null || value.length == 0 ) {
              unset(field);
              return;
            }

            set(new ISOBinaryField(field, value));
          }
        `);
      }
    }
  ],

  properties: [
    {
      class: 'Int',
      name: 'maxField',
      transient: true,
      value: -1,
      javaGetter: `
        if ( maxFieldDirty_ ) {
          maxField_ = 0;
          for ( Object o : fields_.keySet() ) {
            if ( o instanceof Integer ) {
              maxField_ = Math.max(maxField_, (Integer) o);
            }
          }
          maxFieldDirty_ = false;
        }
        return maxField_;
      `
    },
    {
      class: 'Int',
      name: 'fieldNumber',
      value: -1
    },
    {
      class: 'Boolean',
      name: 'dirty',
      transient: true,
      value: true
    },
    {
      class: 'Boolean',
      name: 'maxFieldDirty',
      transient: true,
      value: true
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.ISOPackager',
      name: 'packager',
      transient: true
    },
    {
      class: 'Map',
      name: 'fields',
      javaType: 'java.util.Map<Integer, Object>',
      javaFactory: 'return new java.util.TreeMap<>();'
    }
  ],

  methods: [
    {
      name: 'set',
      javaCode: `
        if ( c != null ) {
          int i = (int) c.getKey();
          getFields().put(i, c);
          if ( i > getMaxField() ) {
            setMaxField(i);
          }
          setDirty(true);
        }
      `
    },
    {
      name: 'unset',
      javaCode: `
        if ( getFields().remove(field) != null ) {
          setDirty(true);
          setMaxFieldDirty(true);
        }
      `
    },
    {
      name: 'getKey',
      javaCode: `
        if ( getFieldNumber() != -1 ) {
          return getFieldNumber();
        }

        throw new IllegalStateException("Not a subfield");
      `
    },
    {
      name: 'getValue',
      javaCode: `
        return this;
      `
    },
    {
      name: 'setValue',
      javaCode: `
        throw new UnsupportedOperationException("setValue unsupported in ISOMessage");
      `
    },
    {
      name: 'getChildren',
      javaCode: `
        return (java.util.Map) ((java.util.TreeMap) getFields()).clone();
      `
    },
    {
      name: 'pack',
      javaCode: `
        synchronized ( this ) {
          getPackager().pack(this, out);
        }
      `
    },
    {
      name: 'unpack',
      javaCode: `
        synchronized ( this ) {
          return getPackager().unpack(this, b);
        }
      `
    }
  ]
});
