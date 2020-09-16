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
  package: 'net.nanopay.sme.ui',
  name: 'UploadFileModal',
  extends: 'foam.u2.View',

  documentation: 'Update load files',

  requires: [
    'net.nanopay.ui.modal.ModalHeader',
    'foam.blob.BlobBlob',
    'foam.log.LogLevel',
    'foam.nanos.fs.File'
  ],

  imports: [
    'blobService',
    'invoice',
    'notify',
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
      height: 200px;
      border: dashed 1px #8e9090;
      border-radius: 3px;
      box-shadow: inset 0 1px 2px 0 rgba(116, 122, 130, 0.21);
      background: #fff;
    }
    ^ .dragText{
      text-align: center;
      height: 200px;
      width: 498px;
      display: table-cell;
      vertical-align: middle;

    }
    ^ .inputImage{
      height: 60px;
      opacity: 1;
      margin-bottom: 10px;
    }
    ^ .inputText{
      width: 177px;
      height: 40px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.43;
      letter-spacing: 0.2px;
      text-align: center;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .inputRestrictText{
      width: 480px;
      height: 16px;
      opacity: 0.7;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 12px;
      font-weight: normal;
      font-style: normal;
      font-stretch: normal;
      line-height: 1.33;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      margin-left: -140px;
    }
    ^ .subheading {
      margin-bottom: 10px;
    }
    ^ textarea {
      width: 100%;
      font-size: 14px;
      height: 40px;
      border: solid 1px #8e9090;
      border-radius: 3px;
      padding: 12px;
    }

    .net-nanopay-sme-ui-CurrencyChoice {
      border: solid 1px #8e9090 !important; 
      border-right: none !important;
    }

    .foam-u2-CurrencyView {
      border: solid 1px #8e9090 !important; 
    }
    ^ .caption {
      font-size: 10px;
      width: 150px;
      position: relative;
      margin: auto;
      top: 40px;
    }
    ^ .foam-u2-ActionView-remove {
      background: none;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'inDropZone'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'data',
      factory: function() {
        if ( this.invoice.invoiceFile ) {
          return this.invoice.invoiceFile;
        }
      }
    },
    'exportData'
  ],

  messages: [
    {
      name: 'DRAG_LABEL',
      message: 'Drag & drop your files here'
    },
    {
      name: 'OR_LABEL',
      message: 'or '
    },
    {
      name: 'BROWSE_LABEL',
      message: 'browse'
    },
    {
      name: 'SUPPORTED_DATA_LABEL',
      message: 'Supported file types: JPG, JPEG, PNG, PDF, DOC, DOCX Max Size: 8MB'
    },
    { name: 'FILE_TYPE_ERROR', message: 'jpg, jpeg, png, pdf, doc, docx only, 8MB maximum' },
    { name: 'FILE_SIZE_ERROR', message: 'File size exceeds 8MB' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this.data = this.exportData;

      this
        .on('dragover', this.onDragOver)
        .on('drop', this.onDropOut)
        .addClass(this.myClass())
        .start().addClass('box-for-drag-drop')
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
          .start().addClass('dragText').show(this.data$.map(function(data) {
            return data.length === 0;
          }))
            .start().addClass('subheading').add(this.DRAG_LABEL).end()
            .start()
              .add(this.OR_LABEL)
              .start('span')
                .addClass('app-link').add(this.BROWSE_LABEL)
                .on('click', this.onAddAttachmentClicked)
              .end()
            .end()
            .start().addClass('subdued-text').addClass('caption').add(this.SUPPORTED_DATA_LABEL).end()
          .end()
          .on('drop', this.onDrop)
          .start('input').addClass('document-input')
            .attrs({
              type: 'file',
              accept: 'image/jpg, image/jpeg, image/png, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document, application/pdf',
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
      if ( typeof e.target != 'undefined' ) {
        if ( e.target.tagName == 'SPAN' && e.target.tagName != 'A' ) {
          this.document.querySelector('.document-input').click();
        }
      } else {
        // For IE browser
        if ( e.srcElement.tagName == 'SPAN' && e.srcElement.tagName != 'A' ) {
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
              if ( this.isFileType(file) ) {
                files.push(file);
              } else {
                this.notify(this.FILE_TYPE_ERROR, '', this.LogLevel.ERROR, true);
              }
            }
          }
        }
      } else if ( e.dataTransfer.files ) {
        inputFile = e.dataTransfer.files;
        for ( var i = 0; i < inputFile.length; i++ ) {
          var file = inputFile[i];
          if ( this.isFileType(file) ) files.push(file);
          else {
            this.notify(this.FILE_TYPE_ERROR, '', this.LogLevel.ERROR, true);
          }
        }
      }
      this.addFiles(files);
    },

    function isFileType(file) {
      if ( file.type === 'image/jpg' ||
          file.type === 'image/jpeg' ||
          file.type === 'image/png' ||
          file.type === 'application/msword' ||
          file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
          // file.type === 'application/vnd.oasis.opendocument.text' ||
          // file.type === 'application/vnd.ms-excel' ||
          // file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.type === 'application/pdf' ) return true;
      return false;
    },

    function onChange(e) {
      var files = e.target.files;
      this.addFiles(files);
      // Remove all temporary files in the element.target.files
      this.document.querySelector('.document-input').value = null;
    },

    function addFiles(files) {
      var errors = false;
      for ( var i = 0; i < files.length; i++ ) {
        // skip files that exceed limit
        if ( files[i].size > ( 8 * 1024 * 1024 ) ) {
          if ( ! errors ) errors = true;
          this.notify(this.FILE_SIZE_ERROR, '', this.LogLevel.ERROR, true);
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
