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
  name: 'ISOBinaryField',
  extends: 'net.nanopay.iso8583.AbstractISOField',

  documentation: 'ISO 8583 binary field',

  properties: [
    {
      class: 'net.nanopay.security.HexString',
      name: 'value'
    }
  ],

  methods: [
    {
      name: 'setValue',
      javaCode: `
        setValue(val instanceof String ? ((String) val).getBytes(java.nio.charset.StandardCharsets.ISO_8859_1) : (byte[]) val);
      `
    },
    {
      name: 'getBytes',
      javaCode: `
        return getValue();
      `
    }
  ]
});
