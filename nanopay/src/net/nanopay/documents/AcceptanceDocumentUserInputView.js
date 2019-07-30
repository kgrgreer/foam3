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

  css: `
  ^ .fontSet {
    font-size: 14px;
    vertical-align: middle;
    line-height: 1.5;
  }
  `,

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
      expression: function() {
        // used for reloading value on stack back
        if ( this.data != 0 ) return true;
        return false;
      },
      postSet: function(o, n) {
        this.data = n ? this.doc.id : 0;
      },
      label2Formatter: function() {
        this.add('I agree to '); // another option: 'I acknowledge that I have read and accept the '
      }
    }
  ],

  methods: [
    function initE() {
      this.start().addClass(this.myClass())
      .startContext({ data: this })
        .start().show(this.isLoading)
          .start(this.AGREED).end()
          .start('span').addClass('sme').addClass('link').addClass('fontSet')
            .add(this.title$)
            .on('click', () => {
              window.open(this.doc.link);
            })
          .end()
        .end()
        .add(this.isLoading$.map((b) => b ? this.LoadingSpinner.create() : null))
      .endContext()
      .end();
    }
  ]
});
