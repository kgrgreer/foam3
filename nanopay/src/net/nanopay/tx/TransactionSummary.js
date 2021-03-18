/**
 * NANOPAY CONFIDENTIAL
 *
 * [2021] nanopay Corporation
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
  package: 'net.nanopay.tx',
  name: 'TransactionSummary',

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.tx.model.Transaction',
      name: 'id'
    },
    {
      class: 'String',
      name: 'currency'
    },
    {
      class: 'UnitValue',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'summary'
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status'
    },
    {
      class: 'String',
      name: 'category'
    },
    {
      class: 'Reference',
      of: 'net.nanopay.integration.ErrorCode',
      targetDAOKey: 'errorCodeDAO',
      name: 'errorCode'
    },
    {
      class: 'String',
      name: 'errorInfo'
    },
    {
      class: 'DateTime',
      name: 'created'
    },
    {
      class: 'DateTime',
      name: 'lastModified'
    }
  ]
});
