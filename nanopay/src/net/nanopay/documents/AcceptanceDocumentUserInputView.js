foam.CLASS({
  package: 'net.nanopay.documents',
  name: 'AcceptanceDocumentUserInputView',
  extends: 'foam.u2.View',

  documentation: `This view display's the AcceptanceDocumentProperty, as a checkbox with a string.
  The displayed string has 2 parts:
  1 - DEFAULT_LABEL, and
  2 - the AcceptanceDocument title, which is displayed as a link to open the doc in a new window.

  Note: 
  1) As soon as this.docName is set we set this.doc, then once this.doc is set we set this.title.
  While this.doc is getting loaded and set, we show a spinner.
  2) The handling of the acceptance of the AcceptanceDocument should be done through
   the model using AcceptanceDocumentProperty.Ex. of usage (SignUp.js).updateUser()`,

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
      name: 'loadingSpin',
      factory: function() {
        return this.LoadingSpinner.create();
      }
    },
    {
      class: 'Boolean',
      name: 'isLoading',
      value: false,
      postSet: function(_, n) {
        if ( n ) {
          this.loadingSpin.show();
          return;
        }
        this.loadingSpin.hide();
      }
    },
    {
      name: 'docLabel',
      class: 'String'
    },
    {
      class: 'String',
      name: 'docName',
      postSet: function(_, n) {
        this.isLoading = true;
        this.acceptanceDocumentService.getAcceptanceDocument(this.__context__, n, '').then((doc) => {
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
      name: 'agreed',
      class: 'Boolean',
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
      if ( this.data != 0 ) this.agreed = true; // used for reloading value on stack back
      this.start().addClass(this.myClass())
      .startContext({ data: this })
        .start().show(this.loadingSpin.isHidden$)
          .start(this.AGREED).end()
          .start('span').addClass('sme').addClass('link').addClass('fontSet')
            .add(this.title$)
            .on('click', () => {
              window.open(this.doc.link);
            })
          .end()
        .end()
        .start().add(this.loadingSpin).end()
      .endContext()
      .end();
    }
  ]
});
