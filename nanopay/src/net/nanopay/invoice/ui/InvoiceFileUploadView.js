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
  `,

  messages: [
    { name: 'ErrorMessage', message: 'One or more file(s) were not uploaded as they exceeded the file size limit of 10MB' }
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .add('Attachments')
          .add(this.slot(function (data) {
            var e = this.E();

            for ( var i = 0 ; i < data.length ; i++ ) {
              e.tag({
                class: 'net.nanopay.invoice.ui.InvoiceFileView',
                data: data[i],
                fileNumber: i + 1,
              });
            }
            return e;
          }, this.data$))
          .start('input').addClass('attachment-input')
            .attrs({
              type: 'file',
              accept: 'application/pdf',
              multiple: 'multiple'
            })
            .on('change', this.onChange)
          .end()
          .start().addClass('attachment-btn white-blue-button btn')
            .add('Add Attachment')
            .on('click', self.onAddAttachmentClicked)
          .end()
        .end();
    },

    function onInvoiceFileRemoved (fileNumber) {
      this.document.querySelector('.attachment-input').value = null;
      this.data.splice(fileNumber - 1, 1);
      this.data = Array.from(this.data);
    }
  ],

  listeners: [
    function onAddAttachmentClicked (e) {
      this.document.querySelector('.attachment-input').click();
    },

    function onChange (e) {
      var errors = false;
      var files = e.target.files;
      for ( var i = 0 ; i < files.length ; i++ ) {
        // skip files that exceed limit
        if ( files[i].size > ( 10 * 1024 * 1024 ) ) {
          if ( ! errors ) errors = true;
          continue;
        }

        this.data.push(this.File.create({
          owner: this.user.id,
          filename: files[i].name,
          filesize: files[i].size,
          mimeType: files[i].type,
          data: this.BlobBlob.create({
            blob: files[i]
          })
        }));
      }
      this.data = Array.from(this.data);

      if ( errors ) {
        this.add(this.NotificationMessage.create({ message: this.ErrorMessage, type: 'error' }));
      }
    }
  ]
});
