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
  package: 'net.nanopay.kotak',
  name: 'KotakCredentials',

  axioms: [foam.pattern.Singleton.create()],

  properties: [
    {
      class: 'Boolean',
      name: 'enable'
    },
    {
      class: 'String',
      name: 'clientId'
    },
    {
      class: 'String',
      name: 'clientSecret'
    },
    {
      class: 'String',
      name: 'encryptionKey'
    },
    {
      class: 'String',
      name: 'accessTokenUrl'
    },
    {
      class: 'String',
      name: 'paymentUrl'
    },
    {
      class: 'String',
      name: 'reversaltUrl'
    },
    {
      class: 'String',
      name: 'msgSource'
    },
    {
      class: 'String',
      name: 'clientCode'
    },
    {
      class: 'String',
      name: 'myProdCode'
    },
    {
      class: 'String',
      name: 'remitterName',
      documentation: 'remitter should always be nanopay for now'
    },
    {
      class: 'String',
      name: 'remitterAddress',
    },
    {
      class: 'String',
      name: 'remitterAcNo'
    },
    {
      class: 'String',
      name: 'remitterCountry'
    },
    {
      class: 'Long',
      name: 'tradePurposeCodeLimit'
    },
    {
      class: 'Long',
      name: 'transactionFee'
    }
  ]
});
