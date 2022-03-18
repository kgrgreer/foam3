foam.CLASS({
  package: 'foam.u2.wizard.common',
  name: 'SuccessWizardletView',
  extends: 'foam.u2.View',

  css: `
    ^ {
      text-align: center;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      height: 100%;
    }
    ^image {
      width: 120pt;
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
        .start('h2')
          .add(this.message$)
        .end()
    }
  ]
});