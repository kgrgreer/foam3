/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'SuccessTransferWizardletView',
  extends: 'foam.u2.wizard.wizardlet.SuccessWizardletView',

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
      margin-top: 120px;
    }
    ^primary-message {
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 32px;
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
    function render() {
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
        .start()
          .style({
            'display': 'flex',
            'justify-content': 'space-between'
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
            .add('# NP1232112321')
          .end()
        .end();
    }
  ]
});
