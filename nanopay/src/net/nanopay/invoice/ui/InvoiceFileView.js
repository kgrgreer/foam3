foam.CLASS({
  package: 'net.nanopay.invoice.ui',
  name: 'InvoiceFileView',
  extends: 'foam.u2.Element',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File'
  ],

  imports: [
    'blobService'
  ],

  properties: [
    'data'
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
      margin: 10px 0;
    }
  `,

  methods: [
    function initE() {
      var self = this;

      this
        .setNodeName('span')
        .addClass(this.myClass())
        .start()
          .add('Attachments')
          .start('input').addClass('attachment-input')
            .attrs({ type: 'file', accept: 'application/pdf' })
            .on('change', this.onChange)
          .end()
          .start().addClass('attachment-btn white-blue-button btn')
            .add('Add Attachment')
            .on('click', this.onAddAttachmentClicked)
          .end()
          .add(this.slot(function(data) {
            var file = data && data.data;
            var url = file && self.blobService.urlFor(file);
            return ! url ? this.E('span') : this.E('a').attrs({ href: url }).add('Download')
          }, this.data$))
          .add('Maximum size 10MB')
        .end()
    }
  ],

  listeners: [
    function onAddAttachmentClicked (e) {
      this.document.querySelector('.attachment-input').click();
    },

    function onChange (e) {
      var file = e.target.files[0];

      this.data = this.File.create({
        filename: file.name,
        mimeType: file.type,
        data: this.BlobBlob.create({
          blob: file
        })
      });
    }
  ]
});
