foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'NotificationMessage',
  extends: 'foam.u2.View',

  documentation: 'error message handler for merchant app.',

  properties: [
    'type',
    'message',
    'data'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() { /*
        ^ {
          width: 250px;
          padding: 20px 60px;
          background: #cff0e1;
          text-align: center;
          position: absolute;
          top: 100px;
          right: 100px;
          border: 1px solid #2cab70;
        }
        ^ .error-background{
          background: #f4cccc;
          border: 1px solid #f33d3d;
        }
        ^ .close-x{
          right: 20px;
          top: 18px;
        }
      */
      }
    })
  ],

  methods: [
    function initE(){
      var self = this;

      this
        .addClass(this.myClass())
        .start()
          .add(this.message)
        .end()
        .start().addClass('close-x').end()

    }
  ]
});