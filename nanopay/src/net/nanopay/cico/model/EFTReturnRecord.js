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
  package: 'net.nanopay.cico.model',
  name: 'EFTReturnRecord',

  properties: [
    {
      class: 'Int',
      name: 'transactionID',
    },
    {
      class: 'String',
      name: 'externalReference'
    },
    {
      class: 'String',
      name: 'returnCode'
    },
    {
      class: 'String',
      name: 'returnDate'
    },
    {
      class: 'Double',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'firstName'
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'account'
    },
    {
      class: 'String',
      name: 'bankNumber'
    },
    {
      class: 'String',
      name: 'transitNumber'
    }
  ]
});
