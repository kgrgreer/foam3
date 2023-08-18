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

  imports: ['wizardlet'],
  css: `
    ^ {
      text-align: center;
      margin: 8rem 0;
    }
    ^centered {
      margin: 1rem auto;

    }
    ^image {
      width: 8rem;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'message',
      expression: function(wizardlet$message) {
        return wizardlet$message || 'Success!';
      }
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
            .addClass(this.myClass('image'), this.myClass('centered'))
          .end()
        .endContext()
        .start()
          .addClass('h300', this.myClass('centered'))
          .add(this.message$)
        .end();
    }
  ]
});
