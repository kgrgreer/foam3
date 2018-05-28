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
      background-color: #59a5d5;
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
      name: 'additionalDocuments'
    }
  ],

  messages: [
    { name: 'UploadSuccess', message: 'Documents uploaded successfully!\nYou may view them in your submitted registration section.' },
    { name: 'UploadFailure', message: 'Failed to upload documents.\nPlease try again later.'}
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
        .add(this.slot(function (documents) {
          if ( documents.length <= 0 ) return;

          var e = this.E()
            .start('span')
            .addClass('attachments')
            .add('Uploaded Attachments')
            .end();

          for ( var i = 0 ; i < documents.length ; i++ ) {
            e.tag({
              class: 'net.nanopay.invoice.ui.InvoiceFileView',
              data: documents[i],
              fileNumber: i + 1,
              removeHidden:true
            });
          }
          return e;
        }, this.user.additionalDocuments$))
        .add(this.slot(function (documents) {
          if ( documents.length <= 0 ) return;

          var e = this.E()
            .start('span')
            .addClass('attachments')
            .add('Attachments')
            .end();

          for ( var i = 0 ; i < documents.length ; i++ ) {
            e.tag({
              class: 'net.nanopay.invoice.ui.InvoiceFileView',
              data: documents[i],
              fileNumber: i + 1,
            });
          }

          e.br().start(self.SAVE_BUTTON).end()
          return e;
        }, this.additionalDocuments$))
    },

    function onInvoiceFileRemoved (fileNumber) {
      this.additionalDocuments.splice(fileNumber - 1, 1);
      this.additionalDocuments = Array.from(this.additionalDocuments);
    }
  ],

  actions: [
    {
      name: 'saveButton',
      label: 'Upload File(s)',
      code: function (X) {
        var self = this;
        X.user.additionalDocuments = (X.user.additionalDocuments.length == 0)? this.additionalDocuments:  X.user.additionalDocuments.concat(this.additionalDocuments)
        this.additionalDocuments = []

        X.userDAO.put(X.user).then(function (result) {
          if ( ! result ) throw new Error(self.UploadFailure);
          X.user.copyFrom(result);
          self.add(self.NotificationMessage.create({ message: self.UploadSuccess }));
        }).catch(function (err) {
          self.add(self.NotificationMessage.create({ message: self.UploadFailure, type: 'error' }));
        });
      }
    },
    {
      name: 'uploadButton',
      label: 'Choose File',
      code: function (X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({
          class: 'net.nanopay.ui.modal.UploadModal',
          exportData$: this.additionalDocuments$
        }))
      }
    }
  ]
});