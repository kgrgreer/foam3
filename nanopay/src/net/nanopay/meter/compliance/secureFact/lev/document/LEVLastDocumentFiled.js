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
  package: 'net.nanopay.meter.compliance.secureFact.lev.document',
  name: 'LEVLastDocumentFiled',
  documentation: 'The details of the last document filed in an LEV document entity report.',

  properties: [
    {
      class: 'String',
      name: 'documentType',
      documentation: 'The document type of the last document filed.'
    },
    {
      class: 'String',
      name: 'documentDate',
      documentation: 'The date that the last document was filed.'
    },
    {
      class: 'Boolean',
      name: 'annualReturn',
      documentation: 'If the last document filed was determined to be an annual return.'
    }
  ]
});
