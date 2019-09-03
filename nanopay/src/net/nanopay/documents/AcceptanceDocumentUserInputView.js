foam.CLASS({
  package: 'net.nanopay.documents',
  name: 'AcceptanceDocumentUserInputView',
  extends: 'foam.u2.View',

  documentation: 'A view for a user to view and accept the latest version of a document.',

  requires: [
    'foam.u2.CheckBox',
    'net.nanopay.ui.LoadingSpinner'
  ],

  imports: [
    'acceptanceDocumentService'
  ],

  properties: [
    {
      class: 'String',
      name: 'docName'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'doc'
    },
    {
      class: 'Boolean',
      name: 'agreed',
      expression: function(data) {
        if ( data != 0 ) return true;
        return false;
      },
      postSet: function(o, n) {
        this.data = n ? this.doc.id : 0;
      }
    }
  ],

  methods: [
    function initE() {
      this.docName$.sub(this.updateDoc);
      this.updateDoc();

      this.start()
        .addClass(this.myClass())
        .startContext({ data: this })
          .start()
            .hide(this.doc$.map((d) => ! d))
            .start(this.AGREED)
              .add(this.doc$.dot('checkboxText'))
              .start('a')
                .add(this.doc$.dot('title'))
                .attrs({
                  href: this.doc$.dot('link'),
                  target: '_blank'
                })
              .end()
            .end()
          .end()
          .add(this.doc$.map( (d) => ! d ? this.LoadingSpinner.create() : null ))
        .endContext()
      .end();
    }
  ],

  listeners: [
    {
      name: 'updateDoc',
      isFramed: true,
      code: function() {
        this.doc = null;
        this.acceptanceDocumentService.getAcceptanceDocument(this.__context__, this.docName, '')
          .then((doc) => {
            this.doc = doc;
          })
          .catch((e) => {
            console.warn('Error occurred finding Terms Agreement: ', e);
          });
      }
    }
  ]
});
