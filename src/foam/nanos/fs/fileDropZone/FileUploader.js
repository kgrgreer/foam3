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
    'fileLabelDAO',
    'notify'
  ],

  messages: [
    { name: 'LABEL_TITLE',       message: 'File Uploader' },
    { name: 'LABEL_FILE_GROUP',  message: 'File Group' },
    { name: 'ERROR_FILE_UPLOAD', message: 'Please provide File and Label' }
  ],

  documentation: 'View to upload file and assign category',

  css: `
    ^ {
      background: $white;
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
      class: 'Reference',
      of: 'foam.nanos.fs.FileLabel',
      name: 'label'
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
        .callIf(this.showTitle, function() {
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
          class: 'foam.u2.view.ReferenceView',
          dao: this.fileLabelDAO,
          data$: this.label$
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
      code: async function(X) {
        if ( this.files[0] && !! this.label ) {
          this.files[0].label = this.label;
          if ( this.owner !== 0 ) {
            this.files[0].owner = this.owner;
          }
          await this.fileDAO.put(this.files[0]);
          X.closeDialog();
        } else {
          this.notify(this.ERROR_FILE_UPLOAD, this.log, this.LogLevel.ERROR, true);
        }
      }
    }
  ]
});
