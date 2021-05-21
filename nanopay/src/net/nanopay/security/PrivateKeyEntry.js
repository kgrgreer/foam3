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
  name: 'PrivateKeyEntry',

  documentation: 'Modelled private key for storage in DAOs',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Private Key algorithm'
    },
    {
      class: 'String',
      name: 'alias',
      documentation: 'Alias of the encrypting key'
    },
    {
      class: 'String',
      name: 'paraphrase',
      documentation: 'Paraphrase for private key if any'
    },    
    {
      class: 'Object',
      name: 'privateKey',
      javaType: 'java.security.PrivateKey',
      documentation: 'Hidden and transient private key to enable passing key to DAO delegates',
      hidden: true,
      transient: true
    },
    {
      class: 'String',
      name: 'encryptedPrivateKey',
      documentation: 'Encrypted Private Key bytes encoded in Base64'
    }
  ]
});
