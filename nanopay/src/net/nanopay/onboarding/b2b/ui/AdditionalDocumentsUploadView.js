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
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'AdditionalDocumentsUploadView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.dialog.NotificationMessage',
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'user',
    'userDAO'
  ],

  exports: [
    'as data',
    'onInvoiceFileRemoved'
  ],

  css: `
    ^ .foam-u2-ActionView-uploadButton {
      width: 135px;
      height: 40px;
      background-color: #59a5d5;
    }
    ^ .foam-u2-ActionView-uploadButton span {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
    }
    ^ .maxSize {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.17;
      letter-spacing: 0.2px;
      text-align: left;
      color: #a4b3b8;
      padding-top: 11px;
      padding-bottom: 20px;
    }
    ^ .attachments {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .net-nanopay-invoice-ui-InvoiceFileView {
      margin-top: 10px;
    }
    ^ .foam-u2-ActionView-saveButton {
      width: 100%;
      height: 40px;
    }
    ^ .foam-u2-ActionView-saveButton span {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
    }
  `,

  properties: [
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'documents'
    }
  ],

  messages: [
    {
      name: 'UploadSuccess',
      message: 'Documents uploaded successfully!\nYou may view them in your ' +
          'submitted registration section.'
    },
    {
      name: 'UploadFailure',
      message: 'Failed to upload documents.\nPlease try again later.'
    },
    {
      name: 'MAXIMUM_SIZE',
      message: 'Maximum size 10MB'
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
          .start(this.UPLOAD_BUTTON).end()
        .start().addClass('maxSize')
          .add(this.MAXIMUM_SIZE)
        .end()
        .add(this.slot(function(docs) {
          if ( docs.length <= 0 ) return;

          var e = this.E()
            .start('span')
            .addClass('attachments')
            .add('Uploaded Attachments')
            .end();

          for ( var i = 0; i < docs.length; i++ ) {
            e.tag({
              class: 'net.nanopay.invoice.ui.InvoiceFileView',
              data: docs[i],
              fileNumber: i + 1,
            });
          }
          return e;
        }, this.documents$));
    },

    function onInvoiceFileRemoved(fileNumber) {
      this.documents.splice(fileNumber - 1, 1);
      this.documents = Array.from(this.documents);
    }
  ],

  actions: [
    {
      name: 'uploadButton',
      label: 'Choose File',
      code: function(X) {
        this.add(foam.u2.dialog.Popup.create(undefined, X).tag({
          class: 'net.nanopay.ui.modal.UploadModal',
          exportData$: this.documents$
        }));
      }
    }
  ]
});
