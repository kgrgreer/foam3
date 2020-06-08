/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.iso8583',
  name: 'ISOMessage',
  extends: 'net.nanopay.iso8583.AbstractISOComponent',

  documentation: 'Represents a high level ISO 8583 message',

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
          public void set(int fieldNumber, String value) {
            if ( foam.util.SafetyUtil.isEmpty(value) ) {
              unset(fieldNumber);
              return;
            }

            if ( ! ( getPackager() instanceof AbstractISOPackager ) ) {
              set(new ISOField(value, fieldNumber));
            } else {
              Object obj = ((AbstractISOPackager) getPackager()).getFieldPackager(fieldNumber);
              if ( obj instanceof ISOBinaryFieldPackager ) {
                set(new ISOBinaryField(foam.util.SecurityUtil.HexStringToByteArray(value), fieldNumber));
              } else {
                set(new ISOField(value, fieldNumber));
              }
            }
          }

          public void set(int fieldNumber, byte[] value) {
            if ( value == null || value.length == 0 ) {
              unset(fieldNumber);
              return;
            }

            set(new ISOBinaryField(value, fieldNumber));
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
        if ( ! getMaxFieldDirty() ) {
          return maxField_;
        }

        setMaxField(0);
        for ( Object o : fields_.keySet() ) {
          if ( o instanceof Integer ) {
            setMaxField(Math.max(maxField_, (Integer) o));
          }
        }

        setMaxFieldDirty(false);
        setMaxField(maxField_);
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
      documentation: 'Packager used to pack this ISO 8583 message',
      transient: true
    },
    {
      class: 'Map',
      name: 'fields',
      documentation: 'ISO 8583 message fields',
      javaType: 'java.util.Map<Integer, Object>',
      javaFactory: 'return new java.util.TreeMap<>();'
    }
  ],

  methods: [
    {
      name: 'set',
      documentation: 'Sets a field.',
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
      documentation: 'Unsets a field.',
      javaCode: `
        if ( getFields().remove(fieldNumber) != null ) {
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
      name: 'calculateBitMap',
      documentation: 'Calculates the message\'s BitMap',
      type: 'Void',
      javaCode: `
        if (!getDirty()) {
          return;
        }

        int mf = Math.min(getMaxField(), 192);
        java.util.BitSet bmap = new java.util.BitSet(mf + 62 >> 6 << 6);
        for (int i = 1; i <= mf; i++)
          if (getFields().get(i) != null)
            bmap.set(i);
        set(new ISOBitMapField(bmap, -1));
        setDirty(false);
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
      documentation: 'Packs the message into the ISO 8583 format.',
      javaCode: `
        synchronized ( this ) {
          calculateBitMap();
          getPackager().pack(this, out);
        }
      `
    },
    {
      name: 'unpack',
      documentation: 'Unpacks an ISO 8583 message.',
      javaCode: `
        synchronized ( this ) {
          getPackager().unpack(this, in);
        }
      `
    }
  ]
});
