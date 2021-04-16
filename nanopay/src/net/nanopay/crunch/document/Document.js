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
  name: 'Document',
  extends: 'foam.nanos.crunch.RenewableData',

  documentation: 'document upload capability',

  imports: [
    'translationService'
  ],

  implements: [
    'foam.core.Validatable'
  ],
  requires: ['foam.nanos.crunch.Capability'],
  messages: [
    { name: 'UPLOAD_REQUEST_MSG', message: 'Provide' },
    { name: 'IMAGE_REQUIRED', message: 'Document(s) required' },
    { name: 'SECTION_HELP_MSG', message: 'Require a document for' },
    { name: 'DOC_UPLOAD_SECTION', message: '${UPLOAD_REQUEST_MSG} ${capability.name}' }
  ],

  sections: [
    {
      name: 'documentUploadSection',
      title: 'Document Upload',
      subTitle: function(evaluateMessage) {
        let capDescription = this.translationService.getTranslation(foam.locale, `${this.capability.id}.description`, this.capability.description);
        return capDescription ? capDescription : evaluateMessage(this.DOC_UPLOAD_SECTION);
      },
      help: function(capability) {
        return `${this.SECTION_HELP_MSG} ${capability.name}`;
      }
    }
  ],

  properties: [
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'documents',
      label: '',
      section: 'documentUploadSection',
      view: function(_, X) {
        let selectSlot = foam.core.SimpleSlot.create({value: 0});
        return foam.u2.MultiView.create({
        views: [
          foam.nanos.fs.fileDropZone.FileDropZone.create({
            files$: X.data.documents$,
            selected$: selectSlot
          }, X),
          foam.nanos.fs.fileDropZone.FilePreview.create({
            data$: X.data.documents$,
            selected$: selectSlot
          })
        ]
        });
      },
      validateObj: function(documents, isRequired) {
        if ( isRequired && documents.length === 0 ) {
          return this.IMAGE_REQUIRED;
        }
      }
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.Capability',
      name: 'capability',
      hidden: true,
      documentation: 'Used by section subTitle and help',
      factory: function() {
        return this.Capability.create();
      },
      javaCompare: 'return 0;'
    },
    {
      class: 'Boolean',
      name: 'isRequired',
      documentation: 'Whether the file is required or not.',
      value: true,
      hidden: true
    }
  ],
  methods: [
    {
      name: 'validate',
      javaCode: `
      if ( getIsRequired() && getDocuments().length == 0 ) {
        throw new foam.core.ValidationException(IMAGE_REQUIRED);
      }
      `
    }
  ]
});
