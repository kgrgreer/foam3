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
  name: 'ISOBinaryFieldPackager',
  extends: 'net.nanopay.iso8583.AbstractISOFieldPackager',

  properties: [
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.interpreter.BinaryInterpreter',
      name: 'interpreter',
      documentation: 'Binary field interpreter',
      javaValue: 'net.nanopay.iso8583.interpreter.LiteralBinaryInterpreter.INSTANCE'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.iso8583.prefixer.Prefixer',
      name: 'prefixer',
      documentation: 'Binary field prefixer',
      javaValue: 'net.nanopay.iso8583.prefixer.NullPrefixer.INSTANCE'
    }
  ],

  methods: [
    {
      name: 'pack',
      javaCode: `
        byte[] data = c.getBytes();
        getPrefixer().encodeLength(data.length, out);
        getInterpreter().interpret(data, out);
      `
    },
    {
      name: 'unpack',
      javaCode: `
        int length = getPrefixer().getPackedLength() == 0 ? getLength() : getPrefixer().decodeLength(in);
        if ( getLength() > 0 && length > 0 && length > getLength() ) {
          throw new IllegalStateException("Field length " + length + " too long. Max: " + getLength());
        }
        c.setValue(getInterpreter().uninterpret(length, in));
      `
    },
    {
      name: 'createComponent',
      javaCode: `
        return new ISOBinaryField.Builder(getX()).setFieldNumber(fieldNumber).build();
      `
    }
  ]
});
