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
  package: 'net.nanopay.documents',
  name: 'AcceptanceDocumentProperty',
  extends: 'foam.core.Reference',

  documentation: 'Means for handling the AcceptanceDocument. Ex. of usage in SignUp.js(July 2019)',

  properties: [
    {
      class: 'Class',
      name: 'of',
      value: 'net.nanopay.documents.AcceptanceDocument'
    },
    {
      class: 'String',
      name: 'docName',
      required: true,
      documentation: 'The name of the document to be loaded.'
    },
    {
      name: 'view',
      factory: function() {
        return {
          class: 'net.nanopay.documents.AcceptanceDocumentUserInputView',
          docName$: this.docName$
        };
      }
    }
  ]
});
