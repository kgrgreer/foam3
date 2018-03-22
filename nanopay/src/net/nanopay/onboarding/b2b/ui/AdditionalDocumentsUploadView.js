foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'AdditionalDocumentsUploadView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.dialog.Popup'
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
  `,

  properties: [
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocuments'
    }
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start(this.UPLOAD_BUTTON).end()
        .add(this.slot(function (documents) {
          var e = this.E();
          if ( documents.length > 0 ) {
            e.br().add('Attachments');
          }

          for ( var i = 0 ; i < documents.length ; i++ ) {
            e.tag({
              class: 'net.nanopay.invoice.ui.InvoiceFileView',
              data: documents[i],
              fileNumber: i + 1,
            });
          }
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