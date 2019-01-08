foam.CLASS({
  package: 'net.nanopay.sme.ui.fileDropZone',
  name: 'FileCard',
  extends: 'foam.u2.View',

  documentation: 'Card based on SME Design',

  requires: [
    'foam.blob.BlobBlob',
    'foam.nanos.fs.File'
  ],

  imports: [
    'allowRemoval',
    'removeFile'
  ],

  exports: [
    'as fileCard'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: row;

      cursor: pointer;

      width: 100%;
      height: 40px;
      margin-top: 8px;
      border: 1px solid #e2e2e3;
      border-radius: 3px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
      box-sizing: border-box;
      padding: 12px 16px;

      -webkit-transition: all .15s ease-in-out;
      -moz-transition: all .15s ease-in-out;
      -ms-transition: all .15s ease-in-out;
      -o-transition: all .15s ease-in-out;
      transition: all .15s ease-in-out;
    }

    ^:first-child {
      margin-top: 0;
    }

    ^ img {
      margin-right: 4px;
      width: 16px;
      height: 16px;
    }

    ^name {
      margin: 0;
      font-size: 14px;
      color: #2b2b2b;
      line-height: 1;
    }

    ^ .net-nanopay-ui-ActionView {
      background: none;
      background-color: transparent;
      border: none;
      box-shadow: none;
      width: auto;
      height: auto;
      padding: 0;

      margin-left: auto;
    }

    ^ .net-nanopay-ui-ActionView:hover {
      background: none;
      background-color: transparent;
    }

    ^close-action {
      margin-left: auto;
    }

    ^close-action span {
      display: none;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'canBeRemoved',
      value: true
    },
    {
      name: 'index'
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.addClass(this.myClass())
        .start({ class: 'foam.u2.tag.Image', data: 'images/attach-icon.svg' }).end()
        .start('p').addClass(this.myClass('name'))
          .add(this.slot(function (filename) {
            var len = filename.length;
            return ( len > 35 ) ? (filename.substr(0, 20) +
              '...' + filename.substr(len - 10, len)) : filename;
          }, this.data.filename$))
        .end()
        .on('click', this.viewFile)
        .start(this.REMOVE_FILE_X).show(this.allowRemoval && this.canBeRemoved).addClass(this.myClass('close-action')).end()
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
      name: 'viewFile',
      code: function() {
        var blob = this.data.data;
        var sessionId = localStorage['defaultSession'];
        if ( this.BlobBlob.isInstance(blob) ) {
          window.open(URL.createObjectURL(blob.blob));
        } else {
          var url = '/service/httpFileService/' + this.data.id;
          // attach session id if available
          if ( sessionId ) {
            url += '?sessionId=' + sessionId;
          }
          window.open(url);
        }
      }
    }
  ]
});
