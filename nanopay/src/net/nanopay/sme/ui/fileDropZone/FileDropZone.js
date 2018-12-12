foam.CLASS({
  package: 'net.nanopay.sme.ui.fileDropZone',
  name: 'FileDropZone',
  extends: 'foam.u2.Controller',

  documentation: 'A default zone to drag & drop files',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.nanos.fs.FileArray',
    'foam.u2.dialog.NotificationMessage',
    'net.nanopay.ui.modal.ModalHeader'
  ],

  imports: [
    'blobService',
    'invoice',
    'uploadFileData',
    'user'
  ],

  exports: [
    'allowRemoval',
    'removeFile'
  ],

  css: `

  `,

  messages: [
    { name: 'LABEL_OR', message: '' },
    { name: 'LABEL_BROWSE', message: '' },
    { name: '', message: '' }
  ],

  properties: [
    {
      class: 'String',
      name: 'title'
    },
    {
      name: 'supportedFormats',
      documentation: `Please use the following format: { 'image/jpg' : 'JPG' }`,
      value: {}
    },
    {
      class: 'Boolean',
      name: 'isMultipleFiles',
      value: true
    },
    {
      class: 'Boolean',
      name: 'allowRemoval',
      value: true
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'data',
      factory: function() {
        return this.FileArray.create();
      }
    },
    {
      name: 'onFilesChanged',
      documentation: 'When a file has been selected/changed/removed, this function will be called. (OPTIONAL)'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      this
        .on('dragover', this.onDragOver)
        .on('drop', this.onDropOut)
        .addClass(this.myClass())
        .add(this.slot(function(data) {
          var e = this.E();
          for ( var i = 0; i < data.length; i++ ) {
            e.tag({
              class: 'net.nanopay.sme.ui.fileDropZone.FileCard',
              data: data[i]
            });
          }
          return e;
        }, this.data$))
    },

    function removeFile() {

    }
  ],

  listeners: [
    function onDragOver(e) {
      e.preventDefault();
      this.exportData = this.data;
    },

    function onDropOut(e) {
      e.preventDefault();
      this.exportData = this.data;
    }
  ]
});
