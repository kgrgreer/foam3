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
    ^ .net-nanopay-ui-ActionView-uploadButton {
      width: 135px;
      height: 40px;
      background-color: #59a5d5;
    }
    ^ .net-nanopay-ui-ActionView-uploadButton span {
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
      color: #093649;
    }
    ^ .net-nanopay-invoice-ui-InvoiceFileView {
      margin-top: 10px;
    }
    ^ .net-nanopay-ui-ActionView-saveButton {
      width: 100%;
      height: 40px;
    }
    ^ .net-nanopay-ui-ActionView-saveButton span {
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
      name: 'newDocuments',
      postSet: function(o, n) {
      },
      factory: () => []
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'documents'
    },
    {
      class: 'Function',
      name: 'onSave'
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
      var self = this;

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
              removeHidden: true
            });
          }
          return e;
        }, this.documents$))

        .add(this.slot(function (newDocuments) {
          if ( newDocuments.length <= 0 ) return;
          var e = this.E()
            .start('span')
            .addClass('attachments')
            .add('Attachments')
            .end();
          for ( var i = 0; i < newDocuments.length; i++ ) {
            e.tag({
              class: 'net.nanopay.invoice.ui.InvoiceFileView',
              data: newDocuments[i],
              fileNumber: i + 1,
            });
          }

          e.br().start(self.SAVE_BUTTON).end();
          return e;
        }, this.newDocuments$));
    },

    function onInvoiceFileRemoved(fileNumber) {
      this.newDocuments.splice(fileNumber - 1, 1);
      this.newDocuments = Array.from(this.newDocuments);
    }
  ],

  actions: [
    {
      name: 'saveButton',
      label: 'Upload File(s)',
      code: async function(X) {
        if ( this.onSave ) {
          try {
            await this.onSave(this.newDocuments);
            this.add(this.NotificationMessage.create({
                message: this.UploadSuccess
              }));
          } catch (exp) {
            console.error(exp);
              this.add(this.NotificationMessage.create({
                message: this.UploadFailure,
                type: 'error'
              }));
          }
        }
      }
    },
    {
      name: 'uploadButton',
      label: 'Choose File',
      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({
          class: 'net.nanopay.ui.modal.UploadModal',
          exportData$: this.newDocuments$
        }));
      }
    }
  ]
});
