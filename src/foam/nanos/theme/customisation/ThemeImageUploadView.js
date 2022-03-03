/**
* @license
* Copyright 2021 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

/**
 * TODO:
 * - Promote to an ImageRWView since we have to make a new file uploader UI everytime
 * - Add support for contextual previews(new window? redactedViews?)
 */

foam.CLASS({
  package: 'foam.nanos.theme.customisation',
  name: 'ThemeImageUploadView',
  extends: 'foam.u2.View',

  requires: [
    'foam.nanos.fs.fileDropZone.FileDropZone',
    'foam.u2.detail.SectionedDetailPropertyView'
  ],
  imports: [
    'controllerMode as CM',
    'ctrl',
    'fileDAO',
    'spThemeDAO',
    'subject',
    'themeDAO',
    'window'
  ],
  exports: ['controllerMode'],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
    ^preview {
      margin: auto;
      max-width: 50%;
    }
    ^preview svg, preview img {
      max-width: 100%;
      height: auto;
      object-fit: contain;
    }
  `,

  messages: [
    { name: 'FILE_REQUIRED', message: 'File Required' },
  ],

  properties: [
    {
      class: 'String',
      name: 'descriptionMessage',
      expression: function(themeProp) {
        return `Updating the logo here updates the ${themeProp.label} for all users using this theme.
        Please use SVGs or high resolution PNGs to ensure best results for the users`;
      },
      writePermissionRequired: true
    },
    {
      class: 'FObjectProperty',
      name: 'themeProp'
    },
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'fileUploader',
      label: 'Upload Logo',
      view: function(_, X) {
        return {
          class: 'foam.nanos.fs.fileDropZone.FileDropZone',
          isMultipleFiles: false,
          files$: X.data.fileUploader$,
          supportedFormats$: X.data.supportedFormats$
        };
      },
      validateObj: function(fileUploader) {
        if ( fileUploader.length == 0 )
          return this.FILE_REQUIRED;
      }
    },
    {
      name: 'supportedFormats',
      value: {
        'image/png': 'PNG',
        'image/svg+xml': 'SVG'
      }
    },
    {
      name: 'previewView',
      value: { class: 'foam.u2.tag.Image' }
    },
    {
      class: 'Enum',
      of: 'foam.u2.ControllerMode',
      name: 'controllerMode',
      factory: function() {
        return foam.u2.ControllerMode.EDIT;
      }
    },
  ],
  methods: [
    function render() {
      var self = this;
      this
        .add(this.controllerMode$.map(m => {
          return this.E().addClass(self.myClass())
            .startContext({ controllerMode: m })
              // .add(this.FILE_UPLOADER)
              // .add(this.PREVIEW_VIEW)
              // TODO: replace with lines above when detailView is complete
              .start(foam.u2.dialog.InlineNotificationMessage, { icon: null, type: 'WARN' })
                .add(this.descriptionMessage)
              .end()
              .tag(this.SectionedDetailPropertyView, { data: self, prop: self.FILE_UPLOADER })
              .start()
                .start()
                  .addClass('p-semiBold')
                  .add('Preview')
                  .style({ 'line-height': '2' })
                .end()
                .start(self.previewView, {
                  data$: self.fileUploader$.map(img => this.getImagePath(img, self.data[this.themeProp])),
                  embedSVG: true
                }, self.imgHolder$)
                  .addClass(this.myClass('preview'))
                .end()
              .end()
            .endContext();
        }));
    },
    function getImagePath(logo, opt_fallback) {
      if ( ! logo || logo.length == 0 ) return opt_fallback;
      var v = Array.isArray(logo) ? logo[0] : logo;
      v = v.data;
      if ( ! v ) return opt_fallback;
      if ( foam.blob.BlobBlob.isInstance(v) ) {
        return URL.createObjectURL(v.blob);
      } else {
        return v.dataString || this.getFileURL(v);
      }
    },
    function getFileURL(file) {
      return '/service/file/' + file.id;
    },
    async function save() {
      if ( ! this.fileUploader[0] ) {
        ctrl.notify('No file uploaded', 'Upload a new file and try again', 'ERROR', true);
        return;
      }
      var v = this.fileUploader[0];
      v.owner = this.subject.user.id;
      try {
        var file = await this.fileDAO.put(v);
        if ( foam.blob.BlobBlob.isInstance(file) ) {
          this.data[this.themeProp] = URL.createObjectURL(file.blob);
        } else {
          this.data[this.themeProp] = file.dataString || this.getFileURL(file);
        }
        this.fileUploader = [];
        return true;
      } catch (x) {
        ctrl.notify('Something went wrong', x.message, 'ERROR', true);
      }
    }
  ]
});
