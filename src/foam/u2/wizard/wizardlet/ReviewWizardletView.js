/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'ReviewWizardletView',
  extends: 'foam.u2.View',

  messages: [
    { name: 'TITLE', message: 'Review your Deposit ' }
  ],

  css: `
    ^ .h200 {
      text-align: center;
      margin: 32px 0;
    }
  `,

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.ReviewItem',
      name: 'items'
    },
    {
      class: 'Boolean',
      name: 'showTitle',
      value: true
    }
  ],

  methods: [
    function render() {
      var self = this;
      this.SUPER();
      this.addClass(this.myClass())
        .start()
          .start().addClass('h200').show(this.showTitle$).add(this.TITLE).end()
          .start().addClass('generic-container')
            .forEach(this.items, function (item) {
              if ( item.noData )  {
                this.start(item.border).tag(item.view).end();
                return;
              }
              // if there is no data
              else if ( ! self.data.value[item.name] ) return;

              // if there is data
              this.start(item.border).tag(item.view, {data: self.data.value[item.name]}).end();
            })
          .end()
        .end();
    }
  ]
});
