/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'SuccessTransferWizardletView',
  extends: 'foam.u2.wizard.wizardlet.SuccessWizardletView',

  imports: [
    'accountDAO'
  ],

  css: `
    ^ {
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      padding: 2rem 0;
      height: 100%;
    }
    ^image {
      width: 144px;
      height: 144px;
      margin-bottom: 40px;
      margin-top: 100px;
    }
    ^primary-message {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 32px;
    }
    ^reference-message-green {
      color: $primary400;
      font-size: 14px;
      nowrap;
    }
    ^reference-message {
      font-size: 14px;
      nowrap;
    }
    ^reference-number {
      font-size: 14px;
      font-weight: 600;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'message',
      value: 'Transfer success?'
    },
    {
      class: 'Image',
      name: 'image',
      view: 'foam.u2.view.ImageView',
      // value: '/images/checkmark-small-green.svg'
      value: '/images/checkmark-outline-green.svg'
    }
  ],

  methods: [
    async function render() {
      // Get the reference number
      var refNum = '';
      if ( this.data.lineItems ) {
        for ( var lineItem in this.data.lineItems ) {
          if ( this.data.lineItems[lineItem].name == 'Reference Number') {
            refNum = this.data.lineItems[lineItem].note;
            break;
          }
        }
      }

      // Figure out if it's a cash transaction
      var isCashPickup = false; 
      if ( this.data.transaction && this.data.transaction.destinationAccount )
      {
        var destAccount = await this.accountDAO.find(this.data.transaction.destinationAccount);
        if ( destAccount ) {
          isCashPickup = ( destAccount.type == 'Cash Pickup' );
        }
      }
      

      this
        .addClass(this.myClass())
        .startContext({ data: this })
          .start(this.IMAGE)
            .addClass(this.myClass('image'))
          .end()
        .endContext()
        .start()
          .addClass(this.myClass('primary-message'))
          .add(this.message$)
        .end()
        .callIf(isCashPickup, function() {
          this.start()
            .start()
              .addClass(this.myClass('reference-message-green'))
              .add('Share the transaction reference number below')
            .end()
            .start()
              .addClass(this.myClass('reference-message'))
              .add('with your recipient so they can pick up their cash from NBP & Pakistan Post Office locations. They\'ll need to present the number at the time of pick-up.')
            .end()
          .end();
        })
        .start()
          .style({
            'display': 'flex',
            'justify-content': 'space-between',
            'margin-top': '32px',
            'margin-bottom': '32px'
          })
          .start()
            .addClass(this.myClass('reference-message')).style({
              'white-space': 'nowrap',
              'margin-right': '0.3rem'
            })
            .add('Transaction Reference ')
          .end()
          .start()
            .addClass(this.myClass('reference-number'))
            .add('# ' + refNum)
          .end()
        .end();
    }
  ]
});
