foam.CLASS({
  package: 'net.nanopay.merchant.ui.setup',
  name: 'SetupInputView',
  extends: 'net.nanopay.merchant.ui.ToolbarView',

  documentation: 'Setup view with serial number',

  requires: [
    'net.nanopay.retail.model.DeviceStatus',
    'net.nanopay.merchant.ui.transaction.TransactionToolbar'
  ],

  imports: [
    'device',
    'stack',
    'deviceDAO',
    'serialNumber',
    'toolbarIcon',
    'toolbarTitle'
  ],

  implements: [
    'foam.mlang.Expressions',
  ],

  properties: [
    ['header', true],
    {
      class: 'Int',
      name: 'retailCode',
      max: 999999
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^ {
          width: 320px;
          background: #2c4389;
        }
        ^ h4{
          width: 259px;
          font-weight: 300;
          text-align: center;
          margin: auto;
          margin-top: 95px;
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
        ^ .setup-next-wrapper {
          position: fixed;
          bottom: 0px;
        }
        ^ .setup-next-button {
          width: 320px;
          height: 72px;
          background-color: #26a96c;
        }
      */
      }
    })
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;
      this.toolbarIcon = 'arrow_back';
      this.toolbarTitle = 'Back';

      this
        .addClass(this.myClass())
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
        .start('div').addClass('setup-next-wrapper')
          .start('button').addClass('setup-next-button')
            .add('Next')
            .on('click', this.onNextClicked)
          .end()
        .end()
    }
  ],

  listeners: [
    function onNextClicked (e) {
      var self = this;

      // look up device, set to active and save
      this.deviceDAO.find(this.serialNumber).then(function (result) {
        if ( ! result ) {
          throw new Error('Device not found');
        }

        result.status = self.DeviceStatus.ACTIVE;
        return self.deviceDAO.put(result);
      })
      .then(function (result) {
        if ( ! result ) {
          throw new Error('Device activation failed');
        }

        self.device.copyFrom(result);
        self.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupSuccessView' });
      })
      .catch(function (err) {
        self.stack.push({ class: 'net.nanopay.merchant.ui.setup.SetupErrorView' });
      });
    }
  ]
});