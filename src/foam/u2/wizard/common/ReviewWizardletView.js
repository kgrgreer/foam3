/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.common',
  name: 'ReviewWizardletView',
  extends: 'foam.u2.View',

  messages: [
    { name: 'TITLE', message: 'Review your Deposit ' }
  ],

  css: `
    ^ .generic-container {
      width: 343px;
    }
    ^ .h200 {
      text-align: center;
      margin: 32px 0;
    }
  `,

  properties: [
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.common.ReviewItem',
      name: 'items'
    }
  ],

  methods: [
    function render() {
      var self = this;
      this.SUPER();
      this.addClass(this.myClass())
        .start()
          .start().addClass('h200').add(this.TITLE).end()
          .start().addClass('generic-container')
            .forEach(this.items, function (item) {
              if ( item.noData )  {
                this.start(item.border).tag(item.view).end();
                return;
              }
                // TODO: uncomment this line once we have data
//              else if ( ! self.data.value[item.name] ) return;

              // TODO: remove this line once we have data(testing)
              this.start(item.border).tag(item.view).end();

              // TODO: uncomment this line once we have data
//              this.start(item.border).tag(item.view, {data: self.data.value[item.name]}).end();
            })
          .end()
        .end();
    }
  ]
});
