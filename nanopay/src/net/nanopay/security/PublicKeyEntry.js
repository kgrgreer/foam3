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
  name: 'PublicKeyEntry',

  documentation: 'Modelled public key for storage in DAOs',

  properties: [
    {
      class: 'Long',
      name: 'id'
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Public Key algorithm'
    },
    {
      class: 'String',
      name: 'alias',
      documentation: 'Alias to identify public key.'
    },     
    {
      class: 'Object',
      name: 'publicKey',
      javaType: 'java.security.PublicKey',
      documentation: 'Hidden and transient public key to enable passing key to DAO delegates',
      hidden: true,
      transient: true
    },
    {
      class: 'String',
      name: 'encodedPublicKey',
      documentation: 'Public Key bytes encoded in Base64'
    }
  ]
});
