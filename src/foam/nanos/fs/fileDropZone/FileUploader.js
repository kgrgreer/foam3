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
      'fileDAO'
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
    }

    ^container {
      padding: 2em;
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
      class: 'String',
      name: 'title',
      value: this.LABEL_TITLE,
      factory: function() {
        return this.LABEL_TITLE;
      }
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      let self = this;

      this
        .addClass(this.myClass())
        .addClass(this.myClass('container'))
        .start('h1')
          .add(this.title)
        .end()
        .start({class: 'foam.nanos.fs.fileDropZone.FileDropZone', files$: this.files$, isMultipleFiles: false})
        .end()
        .start('h4')
          .add(this.LABEL_FILE_GROUP)
        .end()
        .start({class: 'foam.u2.view.ReferenceArrayView', daoKey: 'fileLabelDAO', allowDuplicates: false, data$: this.labels$})
        .end()
        .start('br').end()
        .start('div')
          .startContext({ data: self })
            .addClass(this.myClass('button'))
            .tag(this.UPLOAD, { buttonStyle: foam.u2.ButtonStyle.PRIMARY })
          .endContext()
        .end();
    }
  ],

  actions: [
    {
      name: 'upload',
      label: 'Upload',
      code: function(){
        if ( this.files[0] && !! this.labels.length ) {
          this.files[0].labels = this.labels;
          this.fileDAO.put(this.files[0]);
          this.stack.back();
        } else {
          ctrl.notify(this.ERROR_FILE_UPLOAD, this.log, this.LogLevel.ERROR, true);
        }
      }
    }
  ]
 })
