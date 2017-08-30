foam.CLASS({
  package: 'net.nanopay.interac.ui.etransfer',
  name: 'TransferComplete',
  extends: 'foam.u2.View',

  imports: [
    'viewData',
    'errors',
    'goBack',
    'goNext'
  ],

  exports: [ 'as data' ],

  documentation: 'Interac transfer completion and loading screen.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*

      */}
    })
  ],

  messages: [

  ],

  properties: [

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
        .start('div').addClass('topRow')
          .start({class: 'foam.u2.tag.Image', data: 'images/interac.png'})
            .attrs({srcset: 'images/interac@2x.png 2x, images/interac@3x.png 3x'})
            .addClass('interacImage')
          .end()
        .end();
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
