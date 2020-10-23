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

  messages: [
    { name: 'UPLOAD_REQUEST_MSG', message: 'Please attach a document(s) for' },
    { name: 'IMAGE_REQUIRED', message: 'Please attach a document(s).' },
    { name: 'SECTION_HELP_MSG', message: 'Require a document for' }
  ],

  sections: [
    {
      name: 'documentUploadSection',
      title: 'Document Upload Section',
      subTitle: function(capability) {
        return capability.description ?
          `${capability.description}` :
          `${this.UPLOAD_REQUEST_MSG} ${capability.name}`;
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
        return foam.u2.MultiView.create({
        views: [
          foam.nanos.fs.fileDropZone.FileDropZone.create({
            files$: X.data.documents$
          }, X),
          foam.nanos.fs.fileDropZone.FilePreview.create()
        ]
        });
      },
      validateObj: function(documents, isRequired) {
        if ( isRequired && documents.length === 0 ) {
          return this.IMAGE_REQUIRED;
        }
      },
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.crunch.Capability',
      name: 'capability',
      storageTransient: true,
      hidden: true
    },
    {
      class: 'Boolean',
      name: 'isRequired',
      documentation: 'Whether the file is required or not.',
      value: true,
      hidden: true
    }
  ]
});
