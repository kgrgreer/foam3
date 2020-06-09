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
  name: 'AbstractISOComponent',
  abstract: true,

  documentation: 'Abstract implementation of an ISO Component',

  implements: [
    'net.nanopay.iso8583.ISOComponent'
  ],

  methods: [
    {
      name: 'set',
      javaCode: `
        throw new UnsupportedOperationException("Can't add to Leaf");
      `
    },
    {
      name: 'unset',
      javaCode: `
        throw new UnsupportedOperationException("Can't remove from Leaf");
      `
    },
    {
      name: 'getKey',
      javaCode: `
        throw new UnsupportedOperationException("getKey unsupported in Composite");
      `
    },
    {
      name: 'getValue',
      javaCode: `
        throw new UnsupportedOperationException("getValue unsupported in Composite");
      `
    },
    {
      name: 'getBytes',
      javaCode: `
        throw new UnsupportedOperationException("getBytes unsupported in Composite");
      `
    },
    {
      name: 'getMaxField',
      javaCode: `
        return 0;
      `
    },
    {
      name: 'getChildren',
      javaCode: `
        return new java.util.Hashtable();
      `
    }
  ]
});
