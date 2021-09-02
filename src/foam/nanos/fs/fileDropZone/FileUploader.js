/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs.fileDropZone',
  name: 'FileUploader',
  extends: 'foam.u2.View',

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.fs.fileDropZone.FileDropZone',
    'foam.u2.view.ReferenceArrayView'
  ],

  imports: [
    'fileDAO',
    'fileLabelDAO'
  ],

  messages: [
    { name: 'LABEL_TITLE',       message: 'File Uploader' },
    { name: 'LABEL_FILE_GROUP',  message: 'File Group' },
    { name: 'ERROR_FILE_UPLOAD', message: 'Please provide File and Label' }
  ],

  documentation: 'View to upload file and assign category',

  css: `
    ^ {
      background: /*%WHITE%*/ #FFFFFF;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    ^button {
      text-align: right;
    }
  `,

  properties: [
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'files',
    },
    {
      class: 'StringArray',
      name: 'labels'
    },
    {
      class: 'Boolean',
      name: 'showTitle'
    },
    {
      class: 'Int',
      name: 'owner'
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      var self = this;
      this
        .addClass()
        .callIf(this.showTitle, () => {
          this.start().addClass('h100')
            .add(this.LABEL_TITLE)
          .end();
        })
        .tag(this.FileDropZone, { files$: this.files$, isMultipleFiles: false })
        .start()
          .addClass('h600')
          .add(this.LABEL_FILE_GROUP)
        .end()
        .tag({
          class: 'foam.u2.view.ReferenceArrayView',
          dao: this.fileLabelDAO,
          allowDuplicates: false,
          data$: this.labels$
          })
        .startContext({ data: self })
          .start(this.UPLOAD, { buttonStyle: foam.u2.ButtonStyle.PRIMARY })
            .addClass(this.myClass('button'))
          .end()
        .endContext();
    }
  ],

  actions: [
    {
      name: 'upload',
      code: function(X) {
        if ( this.files[0] && !! this.labels.length ) {
          this.files[0].labels = this.labels;
          if ( this.owner !== 0 ) {
            this.files[0].owner = this.owner;
          }
          this.fileDAO.put(this.files[0]);
          X.closeDialog();
        } else {
          ctrl.notify(this.ERROR_FILE_UPLOAD, this.log, this.LogLevel.ERROR, true);
        }
      }
    }
  ]
});
