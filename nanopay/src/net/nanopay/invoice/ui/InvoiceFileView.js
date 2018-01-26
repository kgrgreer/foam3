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

  exports: [
    'as data'
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
    ^ .attachment-item {
      width: 175px;
      height: 40px;
      background-color: #ffffff;
      padding: 10px;
    }
    ^ .attachment-filename {
      height: 16px;
      font-size: 12px;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #59a5d5;
    }
    ^ .attachment-item-size {
      width: 16.7px;
      height: 8px;
      font-size: 6px;
      line-height: 1.33;
      letter-spacing: 0.1px;
      text-align: left;
      color: #a4b3b8;
    }
    ^ .net-nanopay-ui-ActionView-remove {
      width: 12px;
      height: 12px;
      object-fit: contain;
      float: right;
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
          .add(this.slot(function(data) {
            var file = data && data.data;
            if ( ! file ) {
              return this.E().start()
                .addClass('attachment-btn white-blue-button btn')
                .add('Add Attachment')
                .on('click', self.onAddAttachmentClicked)
                .end()
            } else {
              return this.E()
                .addClass('attachment-item')
                .start('a').addClass('attachment-filename')
                  .attrs({
                    href: self.data.data$.map(function (data) {
                      return self.BlobBlob.isInstance(data) ?
                        URL.createObjectURL(data.blob) :
                        ( self.blobService.urlFor(data) || '');
                    }),
                    target: '_blank'
                  })
                  .add(data.filename)
                .end()
                .add(this.REMOVE);
            }
          }, this.data$))
          .add('Maximum size 10MB')
        .end()
    }
  ],

  actions: [
    {
      name: 'remove',
      icon: 'images/ic-delete.svg',
      code: function (X) {
        this.data = null;
      }
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
        filesize: file.size,
        mimeType: file.type,
        data: this.BlobBlob.create({
          blob: file
        })
      });
    }
  ]
});
