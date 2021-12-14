/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs.fileDropZone',
  name: 'FileDropZone',
  extends: 'foam.u2.Controller',

  documentation: 'A default zone to drag & drop files',

  requires: [
    'foam.log.LogLevel',
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.nanos.fs.FileArray'
  ],

  imports: [
    'ctrl',
    'user',
    'fileTypeDAO'
  ],

  exports: [
    'allowRemoval',
    'removeFile',
    'highlight'
  ],

  css: `
    ^ {
      align-items: center;
      box-sizing: border-box;
      border: 2px dashed /*%GREY3%*/ #B2B6BD;
      border-radius: 4px;
      display: flex;
      flex-direction: column;
      gap: 8px;
      justify-content: space-between;
      padding: 16px 24px;
      text-align: center;
      width: 100%;
    }
    ^:focus {
      background: /*%PRIMARY5%*/ #E5F1FC;
      border: 2px dashed /*%PRIMARY3%*/ #406DEA;
    }
    ^instruction-container.selection {
      margin-bottom: 16px;
    }
    ^input {
      -webkit-appearance: none;
      appearance: none;
      opacity: 0;
      position: absolute;
      z-index: -1;
    }
    ^link, ^link:hover {
      color: /*%PRIMARY3%*/ #406dea;
    }
    ^input:focus + ^instruction-container > ^browse-container > ^link{
      border: 1px solid;
      border-color: /*%PRIMARY1%*/ #406dea;
    }
    ^caption-container {
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    ^caption {
      font-size: 1rem;
      color: #525455;
    }
    ^browse-container{
      align-items: center;
      display: flex;
      flex-direction: column;
      justify-content: space-around;
    }
    ^browse-container-row{
      align-items: center;
      display: flex;
      flex-direction: row;
      justify-content: flex-start;
      gap: 8px;
    }
    ^dragged{
      background: /*%PRIMARY5%*/ #E5F1FC;
      border: 2px dashed /*%PRIMARY3%*/ #406DEA;
    }
  `,

  messages: [
    { name: 'LABEL_DEFAULT_TITLE', message: 'Drag and Drop files here' },
    { name: 'LABEL_OR',            message: 'or' },
    { name: 'LABEL_BROWSE',        message: 'Browse' },
    { name: 'LABEL_SUPPORTED',     message: 'Supported file types:' },
    { name: 'LABEL_MAX_SIZE',      message: 'Max size:' },
    { name: 'ERROR_FILE_TITLE',    message: 'Error' },
    { name: 'ERROR_FILE_TYPE',     message: 'Invalid file type' },
    { name: 'ERROR_FILE_SIZE',     message: 'File size exceeds 15MB' }
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
      name: 'files',
      factory: function() {
        return [];
      }
    },
    {
      class: 'Long',
      name: 'maxSize',
      value: 15,
      documentation: 'Dictates maximum file size in MB (Megabyte).'
    },
    {
      name: 'onFilesChanged',
      class: 'Function',
      documentation: 'When a file has been selected/changed/removed, this function will be called. (OPTIONAL)'
    },
    {
      name: 'selected'
    },
    {
      class: 'Boolean',
      name: 'hasFiles',
      expression: function(files) {
        return files.length;
      }
    },
    {
      class: 'Boolean',
      name: 'isDragged_'
    }
  ],

  methods: [
    async function render() {
      this.SUPER();
      var self = this;

      if ( Object.keys(this.supportedFormats).length == 0 ) {
        let s = await this.fileTypeDAO.select();
        s.array.forEach(type => {
          this.supportedFormats[type.toSummary()] = type.abbreviation;
        });
      }
      var visibilitySlot = this.slot(function(hasFiles, isMultipleFiles) { 
          if ( isMultipleFiles ) return true;
          return ! hasFiles;
        });

      this.start('input')
        .show(visibilitySlot)
        .addClass(this.myClass('input'))
        .addClass(this.instanceClass('input'))
        .attrs({
          type: 'file',
          accept: this.getSupportedTypes(),
          multiple: this.isMultipleFiles ? 'multiple' : ''
        })
        .on('change', this.onChange)
      .end()
      .start().addClass(this.myClass())
        .show(visibilitySlot)
        .addClass(this.myClass('instruction-container'))
        .enableClass('selection', this.hasFiles$)
        .enableClass(this.myClass('dragged'), this.isDragged_$)
        .start()
          .addClass(this.myClass('browse-container'))
          .enableClass(this.myClass('browse-container-row'), this.hasFiles$)
          .start().addClass('p-semiBold').add(this.title || this.LABEL_DEFAULT_TITLE).end()
            .start().addClass('p').add(this.LABEL_OR).end()
            .add(this.slot(function(hasFiles) {
              return this.E().start(this.BROWSE, {
                label: self.LABEL_BROWSE,
                buttonStyle: hasFiles ? 'LINK' : 'SECONDARY'
              })
                .enableClass(this.myClass('link'), self.hasFiles$)
                .attrs({
                  for: 'file-upload'
                })
              .end();
            }))
        .end()
        .start().addClass(this.myClass('caption-container')).hide(this.files$.map((v) => { return v.length > 0; }))
          .start()
            .start('p').addClass(this.myClass('caption')).add(this.LABEL_SUPPORTED).end()
            .start('p').addClass(self.myClass('caption')).add(this.getSupportedTypes(true)).end()
          .end()
          .start()
            .start('p').addClass(this.myClass('caption')).add(this.LABEL_MAX_SIZE + ' ' + this.maxSize + 'MB').end()
          .end()
        .end()
      .end()
      .on('drop', this.onDrop)
      .on('dragover', e => { this.isDragged_ = true; e.preventDefault(); } )
      .on('dragenter', e => { this.isDragged_ = true; e.preventDefault(); })
      .on('dragleave', e => { this.isDragged_ = false; e.preventDefault(); })
      .add(this.slot(function(files) {
        var e = this.E().addClass(self.myClass('fileCards'));
        for ( var i = 0; i < files.length; i++ ) {
          e.tag({
            class: 'foam.nanos.fs.fileDropZone.FileCard',
            data: files[i],
            selected: this.selected,
            index: i
          });
        }
        return e;
      }, this.files$));
    },

    function getSupportedTypes(readable) {
      var supportedTypes = Object.keys(this.supportedFormats);
      var constructedString = '';

      if ( readable ) {
        supportedTypes.forEach((type, index) => {
          constructedString += this.supportedFormats[type];
          if ( index < supportedTypes.length - 1 ) {
            constructedString += ', ';
          }
        });
      } else {
        supportedTypes.forEach((type, index) => {
          constructedString += type;
          if ( index < supportedTypes.length - 1 ) {
            constructedString += ', ';
          }
        });
      }
      return constructedString;
    },

    function addFiles(files) {
      var errors = false;
      for ( var i = 0 ; i < files.length ; i++ ) {
        // skip files that exceed limit
        if ( files[i].size > ( this.maxSize * 1024 * 1024 ) ) {
          if ( ! errors ) errors = true;
          ctrl.notify(this.ERROR_FILE_TITLE, this.ERROR_FILE_SIZE, this.LogLevel.ERROR, true);
          continue;
        }
        var isIncluded = false;
        for ( var j = 0; j < this.files.length; j++ ) {
          if ( this.files[j].filename.localeCompare(files[i].name) === 0 ) {
            isIncluded = true;
            break;
          }
        }
        if ( isIncluded ) continue;
        if ( this.isMultipleFiles ) {
          var f = this.File.create({
            owner:    this.user.id,
            filename: files[i].name,
            filesize: files[i].size,
            mimeType: files[i].type,
            data:     this.BlobBlob.create({
              blob: files[i]
            })
          });
          this.files.push(f);
        } else {
          this.files[0] = this.File.create({
            owner:    this.user.id,
            filename: files[i].name,
            filesize: files[i].size,
            mimeType: files[i].type,
            data:     this.BlobBlob.create({
              blob: files[i]
            })
          });
        }
      }
      if ( this.selected ) this.selected = this.files.length - 1;
      this.files = Array.from(this.files);
    },

    function isFileType(file) {
      return ( file.type in this.supportedFormats );
    },

    function removeFile(atIndex) {
      if ( this.controllerMode === this.controllerMode.VIEW ) {
        return;
      }
      var files = Array.from(this.files);
      files.splice(atIndex, 1);
      if ( this.selected === files.length )
              this.selected = files.length - 1;
      this.files = files;
      this.document.querySelector('.' + this.instanceClass(`input`)).value = null;

    },

    function highlight(atIndex) {
      this.selected = atIndex;
      this.files = this.files;
    }
  ],

  listeners: [
    function onDrop(e) {
      if ( this.controllerMode === this.controllerMode.VIEW ) {
        return;
      }
      this.isDragged_ = false;
      e.preventDefault();
      var files = [];
      var inputFile;
      if ( e.dataTransfer.items ) {
        inputFile = e.dataTransfer.items;
        if ( inputFile ) {
          for ( var i = 0 ; i < inputFile.length ; i++ ) {
            // If dropped items aren't files, reject them
            if ( inputFile[i].kind === 'file' ) {
              var file = inputFile[i].getAsFile();
              if ( this.isFileType(file) ) {
                files.push(file);
              } else {
                ctrl.notify(this.ERROR_FILE_TITLE, this.ERROR_FILE_TYPE, this.LogLevel.ERROR, true);
              }
            }
          }
        }
      } else if ( e.dataTransfer.files ) {
        inputFile = e.dataTransfer.files;
        for ( var i = 0 ; i < inputFile.length ; i++ ) {
          var file = inputFile[i];
          if ( this.isFileType(file) ) {
            files.push(file);
          } else {
            ctrl.notify(this.ERROR_FILE_TITLE, this.ERROR_FILE_TYPE, this.LogLevel.ERROR, true);
          }
        }
      }
      this.addFiles(files);
    },

    function onChange(e) {
      var files = e.target.files;
      this.addFiles(files);
      // Remove all temporary files in the element.target.files
      this.document.querySelector('.' + this.instanceClass(`input`)).value = null;
      this.onFilesChanged();
    }
  ],

  actions: [
    {
      name: 'browse',
      code: function() {
        if ( this.controllerMode === this.controllerMode.VIEW ) {
          return;
        }
        this.document.querySelector('.' + this.instanceClass(`input`)).click();
      }
    }
  ]
});
