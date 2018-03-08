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
    ^ .inputText{
      text-align: center;
      line-height: 60px
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
          .add('Attachment')
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
          //.start(this.UPLOAD_BUTTON, { showLabel:true }).addClass('attachment-btn white-blue-button btn').end()
      
          .start('div').addClass('box-for-drag-drop')
          .start('p').add('Click or drag files here').addClass('inputText').end()
          .on('dragstart', this.onDragStart)
          .on('dragenter', this.onDragOver)
          .on('dragover', this.onDragOver)
          .on('drop', this.onDrop)
          .on('click', self.onAddAttachmentClicked)
          .start('input').addClass('attachment-input')
            .attrs({
              type: 'file',
              accept: 'application/pdf',
              multiple: 'multiple'
            })
            .on('change', this.onChange)
          .end()
          .end()
        .end();
    },

    function onInvoiceFileRemoved (fileNumber) {
      this.document.querySelector('.attachment-input').value = null;
      this.data.splice(fileNumber - 1, 1);
      this.data = Array.from(this.data);
    }
  ],
  actions: [
    {
      name: 'uploadButton',
      label: 'Choose File',

      code: function(X) {
        X.ctrl.add(foam.u2.dialog.Popup.create(undefined, X).tag({class: 'net.nanopay.ui.modal.UploadModal', exportData: X.filteredUserDAO}));
      }
    },
  ],
  listeners: [
    function onAddAttachmentClicked (e) {
      this.document.querySelector('.attachment-input').click();
    },
    function onDragOver(e) {
      console.log("2");         
      e.preventDefault();    
    },
    function onDrop(e) {
      e.preventDefault();  
      console.log("2");         

      var files = []; 
      if (e.dataTransfer.items) {
        // Use DataTransferItemList interface to access the file(s)
        for (var i = 0; i < e.dataTransfer.items.length; i++) {
          // If dropped items aren't files, reject them
          if (e.dataTransfer.items[i].kind === 'file') {
            var file = e.dataTransfer.items[i].getAsFile();
            if(file.type === "application/pdf" || file.type === "image/jpg" || file.type === "image/gif"|| file.type === "image/jpeg" || file.type === "image/bmp"||file.type === "image/png"){
              files.push(file);           
            }
          }
        }
        this.addFiles(files)
      } 
    },
    function onChange (e) {
      var files = e.target.files;
      this.addFiles(files)
    },
    function addFiles(files){
      var errors = false;
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
