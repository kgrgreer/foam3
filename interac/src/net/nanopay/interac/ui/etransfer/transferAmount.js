foam.CLASS({
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferAmount',
  extends: 'foam.u2.View',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext'
  ],

  exports: [ 'as data' ],

  documentation: 'Transfer amount details',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{ }
      */}
    })
  ],

  messages: [
    { name: 'HellowWorld', message: 'Hello World. I am the amount screen!' }
  ],

  methods: [
    function init() {
      this.errors_$.sub(this.errorsUpdate);
      this.errorsUpdate();
    },

    function initE() {
      this.SUPER();

      this
        .addClass(this.myClass())
        .start('div').addClass('row').addClass('rowTopMarginOverride')
          .start('p').addClass('pDefault').add(this.HelloWorld).end()
        .end()
    }
  ],

  listeners: [
    {
      name: 'errorsUpdate',
      code: function() {
        this.errors = this.errors_;
      }
    }
  ]
});
