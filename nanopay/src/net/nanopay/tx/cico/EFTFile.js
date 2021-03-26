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
  package: 'net.nanopay.tx.cico',
  name: 'EFTFile',

  documentation: `Model for an EFT file`,

  implements: [
    'foam.nanos.auth.ServiceProviderAware'
  ],

  tableColumns: [
    'id', 'fileName'
  ],

  properties: [
    {
      name: 'id',
      class: 'Long'
    },
    {
      name: 'fileName',
      class: 'String'
    },
    {
      name: 'provider',
      class: 'Reference',
      of: 'net.nanopay.payment.PaymentProvider'
    },
    {
      name: 'content',
      class: 'String',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 }
    },
    {
      name: 'file',
      class: 'Reference',
      of: 'foam.nanos.fs.File'
    },
    {
      name: 'receipt',
      class: 'Reference',
      of: 'foam.nanos.fs.File'
    },
    {
      name: 'report',
      class: 'Reference',
      of: 'foam.nanos.fs.File'
    },
    {
      name: 'fileCreationTimeEDT',
      class: 'String'
    },
    {
      name: 'retries',
      class: 'Int'
    },
    {
      name: 'status',
      class: 'foam.core.Enum',
      of: 'net.nanopay.tx.cico.EFTFileStatus',
    },
    {
      name: 'failureReason',
      class: 'String',
      view: { class: 'foam.u2.tag.TextArea', rows: 5, cols: 80 }
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.ServiceProvider',
      name: 'spid'
    }
  ]
});
