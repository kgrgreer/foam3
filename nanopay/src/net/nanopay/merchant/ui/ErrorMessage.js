foam.CLASS({
  package: 'net.nanopay.merchant.ui',
  name: 'ErrorMessage',
  extends: 'foam.u2.View',

  documentation: 'error message handler for merchant app.',

  properties: [
    'message'
  ],

  css: `
    ^ {
      width: 100%;
      padding: 10px 0;
      background: #f55a5a;
      text-align: center;
      position: fixed;
      top: 0px;
    }
    ^ {
      -webkit-animation-name: example;
      -webkit-animation-duration: 4s;
      animation-name: slide;
      animation-duration: 4s;
    }
    @keyframes slide {
      0%  { top: 0px; }
      10% { top: 56px; }
      80% { top: 56px; }
      100% { top: 0px; }
    }
  `,

  methods: [
    function initE(){
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .add(this.message)
        .end();

        setTimeout(function() {
          self.remove()
        }, 4000);
    }
  ]
});