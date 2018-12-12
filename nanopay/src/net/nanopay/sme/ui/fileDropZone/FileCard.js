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

  css: `
    ^ {
      display: flex;
      flex-direction: row;

      width: 100%;
      height: 40px;
      margin: 0 16px;
      margin-top: 8px;
      border: 1px solid #e2e2e3;
      border-radius: 3px;
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);

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
      width: 16px;
      height: 16px;
    }

    ^close-action {
      margin-left: auto;
    }
  `,

  properties: [
    {
      class: 'Boolean',
      name: 'canBeRemoved',
      value: true
    }
  ],

  methods: [
    function initE() {
      this.addClass(this.myClass())
        .start({ class: 'foam.u2.tag.Image', data: 'images/attach-icon.svg' }).end()
        .start('a')
          .attrs({
            href: this.data$.map(function (data) {
              var blob = data.data;
              var sessionId = localStorage['defaultSession'];
              if ( self.BlobBlob.isInstance(blob) ) {
                return URL.createObjectURL(blob.blob);
              } else {
                var url = '/service/httpFileService/' + data.id;
                // attach session id if available
                if ( sessionId ) {
                  url += '?sessionId=' + sessionId;
                }
                return url;
              }
            }),
            target: '_blank'
          })
          .add(this.slot(function (filename) {
            var len = filename.length;
            return ( len > 35 ) ? (filename.substr(0, 20) +
              '...' + filename.substr(len - 10, len)) : filename;
          }, this.data.filename$))
        .end()
        .start(this.REMOVE_FILE_X).show(this.allowRemoval && this.canBeRemoved).addClass(this.myClass('close-action')).end()
    }
  ],

  actions: [
    {
      name: 'removeFileX',
      icon: 'images/cancel-x.svg',
      code: function(X) {
        X.removeFile();
      }
    }
  ]
});
