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
  package: 'net.nanopay.security',
  name: 'HashingJournal',
  extends: 'foam.dao.FileJournal',

  properties: [
    {
      class: 'String',
      name: 'algorithm',
      value: 'SHA-256',
      documentation: 'Hashing algorithm to use'
    },
    {
      class: 'Boolean',
      name: 'digestRequired',
      value: false,
      documentation: 'Flag to determine if digest is required when parsing'
    },
    {
      class: 'Boolean',
      name: 'rollDigests',
      value: false,
      documentation: 'Roll digests together'
    },
    {
      class: 'Object',
      name: 'previousDigest',
      type: 'Byte[]',
      documentation: 'Previous digest to use in rolling'
    },
    {
      name: 'outputter',
      javaFactory: `
        try {
          return new HashingOutputter(getX(), this);
        } catch ( Throwable t ) {
          throw new RuntimeException(t);
        }
      `
    },
    {
      name: 'parser',
      javaFactory: `return new HashedJSONParser(getX(), this);`
    }
  ]
});
