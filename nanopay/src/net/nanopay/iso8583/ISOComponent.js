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

foam.INTERFACE({
  package: 'net.nanopay.iso8583',
  name: 'ISOComponent',

  documentation: `
    Represents a high level ISO 8583 Component. A component may be a field on an ISO 8583 or it may
    be an entire ISO 8583 message itself.
  `,

  methods: [
    {
      name: 'set',
      documentation: 'Sets a field.',
      type: 'Void',
      args: [
        {
          name: 'c',
          type: 'net.nanopay.iso8583.ISOComponent'
        }
      ]
    },
    {
      name: 'unset',
      documentation: 'Unsets a field.',
      type: 'Void',
      args: [
        {
          name: 'fieldNumber',
          type: 'Integer'
        }
      ]
    },
    {
      name: 'getFieldNumber',
      type: 'Integer'
    },
    {
      name: 'setFieldNumber',
      type: 'Void',
      args: [
        {
          name: 'val',
          type: 'Integer'
        }
      ]
    },
    {
      name: 'getKey',
      type: 'Any'
    },
    {
      name: 'getValue',
      type: 'Any'
    },
    {
      name: 'setValue',
      type: 'Void',
      args: [
        {
          name: 'val',
          type: 'Any'
        }
      ]
    },
    {
      name: 'getBytes',
      type: 'Byte[]'
    },
    {
      name: 'getMaxField',
      type: 'Integer'
    },
    {
      name: 'getChildren',
      type: 'Map'
    },
    {
      name: 'pack',
      documentation: 'Packs this ISO 8583 component into an OutputStream',
      type: 'Void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    },
    {
      name: 'unpack',
      documentation: 'Unpacks this ISO 8583 component from an InputStream',
      type: 'Void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'in',
          javaType: 'java.io.InputStream'
        }
      ]
    }
  ]
});
