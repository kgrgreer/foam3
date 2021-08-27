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

    ^container .foam-nanos-fs-fileDropZone-FileDropZone-browse-container {
       align-items: center;
       display: flex;
       flex-direction: row;
       justify-content: flex-start;
       gap: 8px;
     }

    ^ .foam-nanos-fs-fileDropZone-FileDropZone-caption-container {
      display: none;
    }

    ^ .foam-nanos-fs-fileDropZone-FileDropZone button {
      background: none!important;
      border: none;
      padding: 0!important;
      color: /*%PRIMARY3%*/ #406DEA;
      cursor: pointer;
    }

    ^ .foam-nanos-fs-fileDropZone-FileDropZone button:hover {
      text-decoration: underline;
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
      name: 'title'
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
          .add(this.LABEL_TITLE)
        .end()
        .start({class: 'foam.nanos.fs.fileDropZone.FileDropZone', files$: this.files$, isMultipleFiles: false})
        .end()
        .start('h4')
          .callIfElse(
            this.title,
            function() {
              this.add(this.title);
            },
            function() {
              this.add(this.LABEL_FILE_GROUP);
            })
        .end()
        .start({class: 'foam.u2.view.ReferenceArrayView', daoKey: 'fileLabelDAO', allowDuplicates: false, data$: this.labels$})
        .end()
        .start('br').end()
          .startContext({ data: self })
            .addClass(this.myClass('button'))
            .tag(this.UPLOAD, { buttonStyle: foam.u2.ButtonStyle.PRIMARY })
          .endContext();
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
