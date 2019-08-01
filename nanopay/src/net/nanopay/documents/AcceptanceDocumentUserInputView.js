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
      class: 'Boolean',
      name: 'isLoading'
    },
    {
      class: 'String',
      name: 'docLabel'
    },
    {
      class: 'String',
      name: 'docName',
      postSet: function(_, n) {
        this.isLoading = true;
        this.acceptanceDocumentService.getAcceptanceDocument(this.__context__, n, '')
          .then((doc) => {
            this.doc = doc;
          })
          .catch((e) => {
            console.warn('Error occurred finding Terms Agreement: ', e);
          })
          .finally(() => {
            this.isLoading = false;
          });
      }
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.documents.AcceptanceDocument',
      name: 'doc',
      postSet: function(_, n) {
        if ( n ) {
          this.title = n.title;
        }
      }
    },
    {
      class: 'String',
      name: 'title',
      documentation: 'This is equivalent to AcceptanceDocument.TITLE'
    },
    {
      class: 'Boolean',
      name: 'agreed',
      expression: function(data) {
        // used for reloading value on stack back
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
      this.start().addClass(this.myClass())
      .startContext({ data: this })
        .start().hide(this.isLoading$)
          .start(this.AGREED)
            .add('I agree to ')
            .start('a')
              .add(this.title$)
              .attrs({
                href: this.doc$.dot('link'),
                target: '_blank'
              })
            .end()
          .end()
        .end()
        .add(this.isLoading$.map((b) => b ? this.LoadingSpinner.create() : null))
      .endContext()
      .end();
    }
  ]
});
