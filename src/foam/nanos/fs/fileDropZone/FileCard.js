/**
 * @license
 * Copyright 2020 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.nanos.fs.fileDropZone',
  name: 'FileCard',
  extends: 'foam.u2.View',

  documentation: 'Card based on SME Design',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File',
    'foam.nanos.fs.FileSizeView',
    'foam.u2.HTMLView',
    'foam.u2.layout.Cols'
  ],

  imports: [
    'allowRemoval',
    'removeFile',
    'highlight',
    'theme'
  ],

  exports: [
    'as fileCard'
  ],

  css: `
    ^ {
      background: $white;
      border: 1px solid $grey50;
      border-radius: 4px;
      box-sizing: border-box;
      height: 40px;
      margin-top: 8px;
      padding: 12px;
      width: 100%;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    ^label {
      align-items: center;
      display: flex;
      gap: 0.5em;
      justify-content: flex-start;
      width: 100%;
    }

    ^ img,^ svg {
      width: 16px;
      height: 16px;
    }

    ^name {
      color: $primary400;
      cursor: pointer;
      overflow: hidden;
      text-align: left;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    ^name:hover {
      color: $primary700;
    }

    ^ .foam-u2-ActionView {
      height: 16px;
      padding: 0;
    }

    ^close-action {
      margin-left: auto;
      padding: 0;
    }

    ^size {
      color: $grey500;
      white-space: nowrap;
    }

    ^fileButton {
      overflow: hidden;
      justify-content: flex-start;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'canBeRemoved',
      expression: function(controllerMode) { return controllerMode != foam.u2.ControllerMode.VIEW; }
    },
    {
      name: 'index'
    },
    {
      name: 'selected'
    }
  ],

  methods: [
    function render() {
      this.SUPER();
      var self = this;
      if ( this.selected == this.index ) {
        this.style({
          'border-color': '$primary700'
        });
      }
      var indicator = this.theme && this.theme.glyphs.file.expandSVG({ fill: this.theme.grey1 });
      var label = this.E()
        .addClass(this.myClass('label'))
        .callIfElse(indicator, function() {  
          this.start(self.HTMLView, { data: indicator }).attrs({ role: 'presentation' }).end();
        }, function() {
          this.start({ class: 'foam.u2.tag.Image', data: 'images/attach-icon.svg' }).end();
        })
        .start().addClass('h600', this.myClass('name'))
          .add(this.data.filename)
        .end()
        .start(this.FileSizeView, { data: this.data.filesize }).addClass(this.myClass('size'), 'p-legal').end();

      this.addClass()
        .start(this.Cols)
          .start(self.File.DOWNLOAD, { label: label, buttonStyle: 'UNSTYLED' }).addClass(this.myClass('fileButton')).end()
          .start(this.REMOVE_FILE_X, {
            label: '',
            buttonStyle: foam.u2.ButtonStyle.TERTIARY,
            themeIcon: 'trash'
          }).show(this.allowRemoval && this.canBeRemoved).addClass(this.myClass('close-action')).end()
        .end();

      this.on('click', this.pick);
    }
  ],

  actions: [
    {
      name: 'removeFileX',
      icon: 'images/cancel-x.png',
      code: function(X) {
        X.removeFile(X.fileCard.index);
      }
    }
  ],

  listeners: [
    {
      name: 'pick',
      code: function(X) {
        this.highlight(this.index);
      }
    }
  ]
});
