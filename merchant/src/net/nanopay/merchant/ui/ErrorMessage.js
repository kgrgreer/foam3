foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'ErrorMessage',
  extends: 'foam.u2.View',

  documentation: 'error message handler for merchant app.',

  properties: [
    'message'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() { /*
        ^ {
          width: 100%;
          padding: 10px 0;
          background: #f55a5a;
          text-align: center;
          position: fixed;
          top: 1;
        }
      */
      }
    })
  ],

  methods: [
    function initE(){
      this
        .addClass(this.myClass())
        .start()
          .add(this.message)
        .end()
    }
  ]
});