foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'UploadAdditionalDocumentsView',
  extends: 'foam.u2.View',

  documentation: 'Upload Additional Documents View',

  requires: [
    'foam.u2.dialog.Popup'
  ],

  imports: [
    'user'
  ],

  messages: [
    { name: 'Title',       message: '1. Upload Additional Documents' },
    { name: 'Description', message: 'Upload any additional documents upon request.' }
  ],

  properties: [
    {
      class: 'foam.nanos.fs.FileArray',
      name: 'additionalDocuments',
      documentation: 'Additional documents for compliance verification.',
      view: function(_, X) {
        return {
          class: 'net.nanopay.onboarding.b2b.ui.AdditionalDocumentsUploadView',
          documents$: X.viewData.user.additionalDocuments$,
        };
      }
    }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('p').addClass('containerTitle').add(this.Title).end()
        .start().addClass('containerDesc').add(this.Description).end()
        .br()
        .start(this.ADDITIONAL_DOCUMENTS).end()
    }
  ]
});