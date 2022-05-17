/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.wizardlet',
  name: 'ReviewWizardletView',
  extends: 'foam.u2.View',

  requires: [
    'foam.u2.ControllerMode'
  ],

  exports: [
    'controllerMode'
  ],

  css: `
    ^ .h200 {
      text-align: center;
      margin: 32px 0;
    }
    ^generic-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'title',
      factory: function(){
        return 'Review Your Request';
      }
    },
    {
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.ReviewItem',
      name: 'items'
    },
    {
      class: 'Boolean',
      name: 'showTitle',
      value: true
    },
    {
      name: 'controllerMode',
      factory: function() {
        return this.ControllerMode.VIEW;
      }
    },
  ],

  methods: [
    function render() {
      var self = this;
      this.SUPER();
      this.addClass(this.myClass())
        .start()
          .start().addClass('h200').show(this.showTitle$).add(this.title$).end()
          .start().addClass(this.myClass('generic-container'))
            .forEach(this.items, function (item) {
              if ( item.noData )  {
                this
                  .start(item.border)
                    .callIf(item.title, function() {
                      this
                      .start()
                        .addClass('h600')
                        .add(item.title)
                      .end();
                    })
                    .start(item.headingBorder)
                      .tag(item.view, {data: self.data.value[item.name]})
                    .end()
                  .end();
                return;
              }
              // if there is no data
              else if ( ! self.data.value[item.name] ) return;

              // if there is data
              this
                .start(item.border)
                  .callIf(item.title, function() {
                    this
                      .start()
                        .addClass('h600')
                        .add(item.title)
                      .end();
                  })
                  .start(item.headingBorder)
                    .tag(item.view, {data: self.data.value[item.name]})
                  .end()
                .end();
            })
          .end()
        .end();
    }
  ]
});
