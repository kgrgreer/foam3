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
  name: 'Signature',

  documentation: 'Modelled signature class.',

  properties: [
    {
      class: 'Reference',
      of: 'foam.nanos.auth.User',
      name: 'signedBy',
      documentation: 'User who created this signature.'
    },
    {
      class: 'String',
      name: 'algorithm',
      documentation: 'Signing algorithm used.',
    },
    {
      class: 'net.nanopay.security.HexString',
      name: 'signature',
      documentation: 'Hex encoded signature.'
    },
    {
      class: 'String',
      name: 'publicKey',
      documentation: 'Hashed version of the Public Key.'
    }
  ]
});
