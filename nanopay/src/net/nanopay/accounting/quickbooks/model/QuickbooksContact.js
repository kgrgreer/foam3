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
  package: 'net.nanopay.accounting.quickbooks.model',
  name: 'QuickbooksContact',
  extends: 'net.nanopay.contacts.Contact',
  documentation: 'Class for Contacts imported from Quick Accounting Software',
  properties: [
    {
      class: 'String',
      name: 'quickId'
    },
    {
      class: 'String',
      name: 'realmId'
    },
    {
      class: 'Boolean',
      name: 'chooseBusiness',
      value: false,
      documentation: 'set this to true to let user manually select the business of this contact'
    },
    {
      class: 'Boolean',
      name: 'desync'
    },
    {
      class: 'Boolean',
      name: 'quickUpdate',
      hidden: true
    },
    {
      class: 'Long',
      name: 'lastUpdated'
    },
    {
      class: 'DateTime',
      name: 'lastDateUpdated',
      label: 'Quickbooks Last Updated',
      visibility: 'RO'
    }
  ]
});
