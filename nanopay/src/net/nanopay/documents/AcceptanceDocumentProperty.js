
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
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'doc'
    },
    {
      name: 'view',
      expression: function() {
        return {
          class: 'net.nanopay.documents.AcceptanceDocumentUserInputView',
          docName$: this.docName$,
          doc$: this.doc$
        };
      }
    }
  ]
});
