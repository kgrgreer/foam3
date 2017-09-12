
foam.CLASS({
  package: 'net.nanopay',
  name: 'Controller',
  extends: 'foam.u2.Element',

  documentation: 'Nanopay Top-Level Application Controller.',

  implements: [
    'foam.nanos.client.Client',
    'foam.mlang.Expressions',
    'net.nanopay.ui.style.appStyling'
  ],

  requires: [
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  exports: [
    'stack',
    'as ctrl'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        .stack-wrapper{
          min-height: calc(80% - 60px);
          margin-bottom: -10px;
        }
        .stack-wrapper:after{
          content: "";
          display: block;
        }
        .stack-wrapper:after, .net-nanopay-b2b-ui-shared-FooterView{
          height: 10px;
        }
      */}
    })
  ],

  properties: [
    {
      name: 'stack',
      factory: function() { return this.Stack.create(); }
    }
  ],

  methods: [
    function init() {
      this.SUPER();

      var self = this;

      this.stack.push({ class: 'net.nanopay.ui.SignInView' });
    },

    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
          .tag({class: 'net.nanopay.ui.topNavigation.TopNav' })
        .br()
        .start('div').addClass('stack-wrapper')
          .tag({class: 'foam.u2.stack.StackView', data: this.stack, showActions: false})
        .end()
        .br()
        .tag({class: 'net.nanopay.ui.FooterView'})
    },
  ]
});
  