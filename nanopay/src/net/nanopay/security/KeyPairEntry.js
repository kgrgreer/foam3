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
  name: 'KeyPairEntry',

  documentation: 'Modelled key pair entry for storage in DAOs',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Keypair algorithm'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'owner',
      documentation: 'Owner of the keypair'
    },
    {
      class: 'String',
      name: 'alias',
      documentation: 'Alias to identify key pair. Typically nanopay user would have multiple keys.'
    },    
    {
      class: 'Reference',
      of: 'net.nanopay.security.PrivateKeyEntry',
      name: 'privateKeyId',
      documentation: 'Reference to private key entry',
      hidden: true,
      networkTransient: true
    },
    {
      class: 'Object',
      name: 'privateKey',
      javaType: 'java.security.PrivateKey',
      documentation: 'Hidden and transient private key to enable passing key through DAO delegates',
      hidden: true,
      transient: true,
    },
    {
      class: 'Reference',
      of: 'net.nanopay.security.PublicKeyEntry',
      name: 'publicKeyId',
      documentation: 'Reference to public key entry'
    },
    {
      class: 'Object',
      name: 'publicKey',
      javaType: 'java.security.PublicKey',
      documentation: 'Hidden and transient public key to enable passing key through DAO delegates',
      hidden: true,
      transient: true
    }
  ]
});
