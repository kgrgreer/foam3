/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'SuccessWizardletView',
  extends: 'foam.u2.View',

  axioms: [foam.pattern.Faceted.create()],

  css: `
    ^ {
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      margin: 8rem 0;
      height: 100%;
      gap: 42px;
    }
    ^image {
      width: 12rem;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'message',
      value: 'Success!'
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
          .addClass('h200')
          .add(this.message$)
        .end();
    }
  ]
});
