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
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
    }
    ^ .maxSize {
      font-family: Roboto;
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
      font-family: Roboto;
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
      font-family: Roboto;
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
    }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
          .start(this.UPLOAD_BUTTON).end()
        .start().addClass('maxSize')
          .add('Maximum size 10MB')
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
