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
  package: 'net.nanopay.iso8583.interpreter',
  name: 'BinaryInterpreter',

  documentation: 'Interface to interpret byte array data',

  methods: [
    {
      name: 'interpret',
      type: 'Void',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'data',
          type: 'Byte[]',
        },
        {
          name: 'out',
          javaType: 'java.io.OutputStream'
        }
      ]
    },
    {
      name: 'uninterpret',
      type: 'Byte[]',
      javaThrows: [
        'java.io.IOException'
      ],
      args: [
        {
          name: 'length',
          type: 'Integer'
        },
        {
          name: 'in',
          javaType: 'java.io.InputStream'
        }
      ]
    },
    {
      name: 'getPackedLength',
      type: 'Integer',
      args: [
        {
          name: 'bytes',
          type: 'Integer'
        }
      ]
    }
  ]
});
