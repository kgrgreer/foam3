foam.CLASS({
  package: 'net.nanopay.sme.ui',
  name: 'UploadFileModal',
  extends: 'foam.u2.View',

  documentation: 'Update load files',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.u2.dialog.NotificationMessage'
  ],

  imports: [
    'blobService',
    'invoice',
    'uploadFileData',
    'user',
  ],

  exports: [
    'as data',
    'onInvoiceFileRemoved'
  ],

  css: `
    ^ .document-input {
      width: 0.1px;
      height: 0.1px;
      opacity: 0;
      overflow: hidden;
      position: absolute;
      z-index: -1;
    }
    ^ .box-for-drag-drop {
      height: 100%;
      width: 100%;
      overflow-y: scroll;
      border: dashed 1px black;
    }
    ^ .dragText{
      text-align: center;
      height: 100%;
      padding-top: 40px;
    }
    ^ .inputImage{
      height: 60px;
      opacity: 1;
      margin-bottom: 10px;
    }
    ^ .inputText{
      width: 177px;
      height: 40px;
      font-family: Roboto;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.43;
      letter-spacing: 0.2px;
      text-align: center;
      color: #093649;
    }
    ^ .inputRestrictText{
      width: 480px;
      height: 16px;
      opacity: 0.7;
      font-family: Roboto;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
      margin-left: -140px;
    }
  `,
  
  properties: [
    {
      class: 'Boolean',
      name: 'inDropZone'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'data'
    },
    'exportData'
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.data = this.exportData;

      this
        .on('dragover', this.onDragOver)
        .on('drop', this.onDropOut)
        .addClass(this.myClass())
        .start('div').addClass('box-for-drag-drop')
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
          .start('div').addClass('dragText').show(this.data$.map(function(data) {
            return data.length === 0;
          }))
            .start().add('Drag and drop files to upload').end()
            .start().add('OR').end()
            .start({ class: 'foam.u2.tag.Image', data: 'images/ic-created.svg' })
              .addClass('inputImage').on('click', this.onAddAttachmentClicked)
            .end()
            .start().add('Maximum file size 10MB').end()
            // .start('p').add(this.BoxText).addClass('inputText').end()
            // .start('p').add(this.FileRestrictText).addClass('inputRestrictText').end()
          .end()
          .on('drop', this.onDrop)
          .start('input').addClass('document-input')
            .attrs({
              type: 'file',
              accept: "image/jpg , image/jpeg , image/png , application/msword , application/vnd.openxmlformats-officedocument.wordprocessingml.document , application/vnd.ms-powerpoint , application/vnd.openxmlformats-officedocument.presentationml.presentation , application/vnd.openxmlformats-officedocument.presentationml.slideshow , application/vnd.oasis.opendocument.text , application/vnd.ms-excel , application/vnd.openxmlformats-officedocument.spreadsheetml.sheet , application/pdf",
              multiple: 'multiple'
            })
            .on('change', this.onChange)
          .end()
        .end();
    },

    function onInvoiceFileRemoved(fileNumber) {
      var data = Array.from(this.data);
      data.splice(fileNumber - 1, 1);
      this.data = data;
      this.document.querySelector('.document-input').value = null;
      this.invoice.invoiceFile = Array.from(this.data);
    }
  ],

  listeners: [
    function onAddAttachmentClicked(e) {
      console.log('123');
      if ( typeof e.target != 'undefined' ) {
        if ( e.target.tagName != 'SPAN' && e.target.tagName != 'A' ) {
          this.document.querySelector('.document-input').click();
        }
      } else {
        // For IE browser
        if ( e.srcElement.tagName != 'SPAN' && e.srcElement.tagName != 'A' ) {
          this.document.querySelector('.document-input').click();
        }
      }
    },

    function onDragOver(e) {
      e.preventDefault();
      this.exportData = this.data;
    },

    function onDropOut(e) {
      e.preventDefault();
      this.exportData = this.data;
    },

    function onDrop(e) {
      e.preventDefault();
      var files = [];
      var inputFile;
      if ( e.dataTransfer.items ) {
        inputFile = e.dataTransfer.items;
        if ( inputFile ) {
          for ( var i = 0; i < inputFile.length; i++ ) {
            // If dropped items aren't files, reject them
            if ( inputFile[i].kind === 'file' ) {
              var file = inputFile[i].getAsFile();
              if ( this.isImageType(file) ) {
                files.push(file);
              } else {
                this.add(this.NotificationMessage.create({ message: this.FileTypeError, type: 'error' }));
              }
            }
          }
        }
      } else if ( e.dataTransfer.files ) {
        inputFile = e.dataTransfer.files;
        for ( var i = 0; i < inputFile.length; i++ ) {
          var file = inputFile[i];
          if ( this.isImageType(file) ) files.push(file);
          else {
            this.add(this.NotificationMessage.create({ message: this.FileTypeError, type: 'error' }));
          }
        }
      }
      this.addFiles(files);
    },

    function isImageType(file) {
      if ( file.type === "image/jpg" ||
          file.type === "image/jpeg" ||
          file.type === "image/png" ||
          file.type === "application/msword" ||
          file.type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
          file.type === "application/vnd.ms-powerpoint" ||
          file.type === "application/vnd.openxmlformats-officedocument.presentationml.presentation" ||
          file.type === "application/vnd.openxmlformats-officedocument.presentationml.slideshow" ||
          file.type === "application/vnd.oasis.opendocument.text" ||
          file.type === "application/vnd.ms-excel" ||
          file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
          file.type === "application/pdf" ) return true;
      return false;
    },

    function onChange(e) {
      var files = e.target.files;
      this.addFiles(files);
    },

    function addFiles(files) {
      var errors = false;
      for ( var i = 0; i < files.length; i++ ) {
        // skip files that exceed limit
        if ( files[i].size > ( 10 * 1024 * 1024 ) ) {
          if ( ! errors ) errors = true;
          this.add(this.NotificationMessage.create({ message: this.FileSizeError, type: 'error' }));
          continue;
        }
        var isIncluded = false;
        for ( var j = 0; j < this.data.length; j++ ) {
          if ( this.data[j].filename.localeCompare(files[i].name) === 0 ) {
            isIncluded = true;
            break;
          }
        }
        if ( isIncluded ) continue;
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
      this.uploadFileData = Array.from(this.data);
    }
  ]
});
