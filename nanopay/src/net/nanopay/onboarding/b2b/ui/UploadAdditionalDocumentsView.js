foam.CLASS({
  package: 'net.nanopay.onboarding.b2b.ui',
  name: 'UploadAdditionalDocumentsView',
  extends: 'foam.u2.View',

  documentation: 'Upload Additional Documents View',

  imports: [
    'user'
  ],

  messages: [
    { name: 'Title',       message: '1. Upload Additional Documents' },
    { name: 'Description', message: 'Upload any additional documents upon request.' }
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('p').addClass('containerTitle').add(this.Title).end()
        .start().addClass('containerDesc').add(this.Description).end()
    }
  ]
});