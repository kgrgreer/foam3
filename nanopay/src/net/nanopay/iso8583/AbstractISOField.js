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
  name: 'AbstractISOField',
  extends: 'net.nanopay.iso8583.AbstractISOComponent',
  abstract: true,

  documentation: `
    Abstract ISO 8583 field containing only the field number (the key)
    Subclasses must provide a corresponding value property.
  `,

  properties: [
    {
      class: 'Int',
      name: 'fieldNumber',
      value: -1
    },
  ],

  methods: [
    {
      name: 'pack',
      javaCode: `
        throw new UnsupportedOperationException("Not available on Leaf");
      `
    },
    {
      name: 'unpack',
      javaCode: `
        throw new UnsupportedOperationException("Not available on Leaf");
      `
    },
    {
      name: 'getKey',
      javaCode: `
        return getFieldNumber();
      `
    }
  ]
});
