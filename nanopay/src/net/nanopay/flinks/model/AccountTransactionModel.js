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
  package: 'net.nanopay.flinks.model',
  name: 'AccountTransactionModel',

  documentation: 'model for the Flinks account transaction model',

  properties: [
    {
      class: 'String',
      name: 'Date'
    },
    {
      class: 'String',
      name: 'Code'
    },
    {
      class: 'String',
      name: 'Description'
    },
    {
      class: 'Double',
      name: 'Debit'
    },
    {
      class: 'Double',
      name: 'Credit'
    },
    {
      class: 'Double',
      name: 'Balance'
    },
    {
      class: 'String',
      name: 'Id'
    }
  ]
});