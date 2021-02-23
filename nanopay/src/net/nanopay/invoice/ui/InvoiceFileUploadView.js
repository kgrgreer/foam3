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
  package: 'net.nanopay.invoice.ui',
  name: 'InvoiceFileUploadView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'user',
    'blobService'
  ],

  exports: [
    'as data',
    'onInvoiceFileRemoved'
  ],

  properties: [
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'data'
    }
  ],

  css: `
    ^ .attachment-input {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      z-index: -1;
    }
    ^ .attachment-btn {
      margin: 10px 0 50px;
    }
    ^ .box-for-drag-drop {
      border: 5px dashed #1234;
      height: 100px;
      width: 200px;
    }
    ^ .inputText {
      text-align: center;
      line-height: 60px
    }
  `,

  messages: [
    { name: 'ErrorMessage', message: 'One or more file(s) were not uploaded as they exceeded the file size limit of 10MB' }
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start()
          .add('Attachments')
          .add(this.slot(function(data) {
            var e = this.E();
            for ( var i = 0; i < data.length; i++ ) {
              e.tag({
                class: 'net.nanopay.invoice.ui.InvoiceFileView',
                data: data[i],
                fileNumber: i + 1,
              });
            }
            return e;
          }, this.data$))
          .start(this.UPLOAD_BUTTON)
            .addClass('attachment-btn').addClass('white-blue-button').addClass('btn')
          .end()
        .end();
    },

    function onInvoiceFileRemoved(fileNumber) {
      var data = Array.from(this.data);
      data.splice(fileNumber - 1, 1);
      this.data = data;
    }
  ],

  actions: [
    {
      name: 'uploadButton',
      label: 'Choose File',

      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X)
            .tag({
              class: 'net.nanopay.ui.modal.UploadModal',
              exportData$: this.data$
            })
        );
      }
    },
  ],
  listeners: [
    function onAddAttachmentClicked(e) {
      this.document.querySelector('.attachment-input').click();
    },
  ]
});
