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
  name: 'EFTConfirmationFileRecord',

  properties: [
    {
      class: 'Int',
      name: 'lineNumber',
    },
    {
      class: 'String',
      name: 'status'
    },
    {
      class: 'String',
      name: 'EFTTransactionId'
    },
    {
      class: 'String',
      name: 'reason'
    },
    {
      class: 'String',
      name: 'PADType'
    },
    {
      class: 'String',
      name: 'transactionCode'
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
      name: 'referenceId'
    }
  ]
});