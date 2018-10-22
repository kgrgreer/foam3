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
      name: 'packager'
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
          fields_.put(i, c);
          if ( i > maxField_ ) {
            maxField_ = i;
          }
          dirty_ = true;
        }
      `
    },
    {
      name: 'unset',
      javaCode: `
        if ( fields_.remove(field) != null ) {
          dirty_ = maxFieldDirty_ = true;
        }
      `
    },
    {
      name: 'getKey',
      javaCode: `
        if ( fieldNumber_ != -1 ) {
          return fieldNumber_;
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
      name: 'pack',
      javaCode: `
        synchronized ( this ) {
          return packager_.pack(this);
        }
      `
    },
    {
      name: 'unpack',
      javaCode: `
        synchronized ( this ) {
          return packager_.unpack(this, b);
        }
      `
    }
  ]
});
