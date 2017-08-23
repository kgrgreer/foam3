
foam.CLASS({
  package: 'net.nanopay.b2b.ui.settings',
  name: 'DebugView',
  extends: 'foam.u2.Element',

  documentation: 'Used for debugging purposes.',

  imports: [
    'businessDAO',
    'countryDAO',
    'invoiceDAO',
    'userDAO'
  ],

  methods: [
    function initE() {
      this
        .start('h3').add('Businessess').end()
        .tag({class: 'foam.u2.view.TableView', data: this.businessDAO})
        .start('h3').add('Invoices').end()
        .tag({class: 'foam.u2.view.TableView', data: this.invoiceDAO})
        .start('h3').add('Users').end()
        .tag({class: 'foam.u2.view.TableView', data: this.userDAO})
        .start('h3').add('Countries').end()
        .tag({class: 'foam.u2.view.TableView', data: this.countryDAO})
        .br()
        .add(this.DOC_BROWSER);
    }
  ],

  actions: [
    function docBrowser() {
      foam.debug.doc();
    }
  ]
});