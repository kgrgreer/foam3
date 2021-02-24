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
  package: 'net.nanopay.tx',
  name: 'ChainSummary',

  javaImports: [
    'net.nanopay.tx.model.TransactionStatus',
    'net.nanopay.integration.ErrorCode',
    'foam.dao.DAO',
  ],

  properties: [
    {
      class: 'String',
      name: 'summary',
      documentation: 'Summary of the transaction status.',
      gridColumns: 4
    },
    {
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.model.TransactionStatus',
      name: 'status',
      documentation: 'Status of the transaction chain.',
      gridColumns: 4
    },
    {
      class: 'String',
      name: 'category',
      documentation: 'Category of the transaction status.',
      gridColumns: 4
    },
    {
      class: 'Reference',
      of: 'net.nanopay.integration.ErrorCode',
      targetDAOKey: 'errorCodeDAO',
      name: 'errorCode',
      documentation: 'Error code for transaction chain.',
      gridColumns: 4
    },
    {
      class: 'String',
      name: 'errorInfo',
      documentation: 'Error information for transaction chain.',
      javaValue:`
        ( getErrorCode() == 0 ) ? "No Error" :
        ( findErrorCode(foam.core.XLocator.get()) == null ) ? "Unknown Error: " + getErrorCode() :
          findErrorCode(foam.core.XLocator.get()).getSummary()
      `,
      gridColumns: 8
    }
  ],

  methods: [
    {
      name: 'toSummary',
      type: 'String',
      code: function() {
        return this.category + ' ' + this.status.name;
      },
      javaCode: `
        if ( getCategory() != null && getCategory().length() > 0) {
          return getCategory() + ' ' + getStatus().getName();
        }
        
        return getStatus().getName();
      `
    }
  ]
});
