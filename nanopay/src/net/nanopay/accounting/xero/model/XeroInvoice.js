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
  package: 'net.nanopay.accounting.xero.model',
  name: 'XeroInvoice',
  extends: 'net.nanopay.invoice.model.Invoice',
  documentation: 'Class for Invoices imported from Xero Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'xeroId'
    },
    {
      class: 'String',
      name: 'xeroOrganizationId'
    },
    {
      class: 'String',
      name: 'businessName'
    },
    {
      class: 'Boolean',
      name: 'desync'
    },
    {
      class: 'Boolean',
      name: 'xeroUpdate',
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'complete',
      hidden: true,
      value: false
    },
    {
      class: 'Long',
      name: 'lastUpdated',
      documentation: ' When this invoice was last updated on xero.'
    },
    {
      class: 'DateTime',
      name: 'lastDateUpdated',
      label: 'Xero Last Updated',
      visibility: 'RO'
    }
  ]
});
