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
    { name: 'EXPIRED_DOCUMENT_ERROR', message: 'Document expired. Please upload a new document.' }, 
    { name: 'EXPIRY_NULL_ERROR', message: 'Please provide the date of expiry as shown on your document.' }
  ],

  properties: [
    'documents',
    {
      name: 'dataConfiguredExpiry',
      value: true,
      section: 'documentUploadSection'
    },
    {
      name: 'expiry',
      section: 'documentUploadSection',
      label: 'Date of Expiry',
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
          errorMessage: 'EXPIRY_NULL_ERROR'
        },
        {
          args: ['expiry'],
          predicateFactory: function(e) {
            var today = new Date();
            return e.OR(
              e.EQ(net.nanopay.crunch.document.ExpirableDocument.EXPIRY, null),
              e.GT(net.nanopay.crunch.document.ExpirableDocument.EXPIRY, today)
            );
          },
          errorMessage: 'EXPIRED_DOCUMENT_ERROR'
        }
      ]
    }
  ]
});
