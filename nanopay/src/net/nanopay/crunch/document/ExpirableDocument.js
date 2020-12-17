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
  package: 'net.nanopay.crunch.document',
  name: 'ExpirableDocument',
  extends: 'net.nanopay.crunch.document.Document',

  messages: [
    { name: 'EXCEED_EXPIRY_LIMIT_ERROR', message: 'Expiry date must not exceed 10 years'},
    { name: 'EXPIRED_DOCUMENT_ERROR', message: 'Expiry date must be a future date' },
    { name: 'INVALID_EXPIRY_ERROR', message: 'Valid expiry date required' }
  ],

  properties: [
    'documents',
    {
      name: 'dataConfiguredExpiry',
      value: true,
      section: 'documentUploadSection'
    },
    {
      class: 'Date',
      name: 'expiry',
      section: 'documentUploadSection',
      label: 'Expiry date',
      documentation: 'The date of expiry on the document',
      help: `
        Please provide the date of expiry as shown on your identification.
        This identification document will be valid until the date of expiry, up to ten years.
      `,
      hidden: false,
      createVisibility: (documents) => {
        return documents && documents.length > 0 ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      updateVisibility: (documents) => {
        return documents && documents.length > 0 ? foam.u2.DisplayMode.RW : foam.u2.DisplayMode.HIDDEN;
      },
      validationPredicates: [
        {
          args: ['expiry'],
          predicateFactory: function(e) {
            return e.NEQ(net.nanopay.crunch.document.ExpirableDocument.EXPIRY, null);
          },
          errorMessage: 'INVALID_EXPIRY_ERROR'
        },
        {
          args: ['expiry'],
          predicateFactory: function(e) {
            var today = new Date();
            return e.GT(net.nanopay.crunch.document.ExpirableDocument.EXPIRY, today);
          },
          errorMessage: 'EXPIRED_DOCUMENT_ERROR'
        },
        {
          args: ['expiry'],
          predicateFactory: function(e) {
            var limit = new Date();
            limit.setFullYear(new Date().getFullYear() + 10);
            return e.LT(net.nanopay.crunch.document.ExpirableDocument.EXPIRY, limit);
          },
          errorMessage: 'EXCEED_EXPIRY_LIMIT_ERROR'
        }
      ]
    }
  ]
});
