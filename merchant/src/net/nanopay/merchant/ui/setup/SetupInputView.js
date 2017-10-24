foam.CLASS({
  package: 'net.nanopay.merchant.ui.setup',
  name: 'SetupInputView',
  extends: 'foam.u2.Controller',

  documentation: 'Setup view with serial number',

  imports: [
    'device',
    'stack',
    'deviceDAO',
    'serialNumber'
  ],

  properties: [
    {
      class: 'Int',
      name: 'retailCode',
      max: 999999
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ .net-nanopay-merchant-ui-BackElement{
          position: relative;
          left: 25px;
        }
        ^ h4{
          width: 259px;
          font-weight: 300;
          text-align: center;
          margin: auto;
          margin-top: 90px;
        }
        ^ input {
          width: 265px;
          background: none;
          color: white;
          border: none;
          font-size: 40px;
          letter-spacing: 20px;
          margin-left: 42px;
          margin-top: 50px;
          padding-bottom: 7px;          
        }
        ^ input:focus{
          outline: none;
          color: transparent;
          text-shadow: 0px 0px 0px white;
        }
        ^ .line{
          width: 26px;
          height: 3px;
          background: white;
          display: inline-block;
          margin-left: 17px;
        }
        ^ .dotted-container{
          width: 265px;
          margin: auto;
        }
        .setup-next-wrapper {
          padding-top: 103px;
        }
        .setup-next-button {
          width: 320px;
          height: 72px;
          background-color: #26a96c;
        }
        ^ .foam-u2-ActionView-next{
          position: absolute;
          width: 100%;
          height: 80px;
          bottom: 75px;
          opacity: 0.01;
        }
      */
      }
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .tag({ class: 'net.nanopay.merchant.ui.BackElement'})        
        .start('h4')
          .add('Enter the code showed in retail portal to finish provision.')
        .end()
        .start().start(this.RETAIL_CODE).end().end()
        .start().addClass('dotted-container')
          .call(function(){
            for(i = 0; i < 6; i++){
              this.start().addClass('line').end()              
            }
          })
        .end()
        .start().addClass('setup-next-wrapper')
          .start('button').addClass('setup-next-button')
            .add('Next')
            .add(this.NEXT)
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'next',
      label: '',
      code: function (X) {
        /* not sure what service or model to call here but the retail code is available under X.retailCode */
        X.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupSuccessView' })
      }
    }
  ]
});