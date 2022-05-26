/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'FlexibleWizardContentsView',
  extends: 'foam.u2.View',

  issues: [
    'Add loading spinner support to ^'
  ],

  imports: [
    'actionProvider?'
  ],

  requires: [
    'foam.u2.ActionReference'
  ],

  documentation: `
    This wizard view uses flex to center its contents.
  `,

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: 40pt;
    }
    ^flexButtons {
      display: flex;
      flex-direction: column;
      gap: 20pt;
    }
    ^flexButtons > * {
      flex-grow: 1;
      margin-left: 0 !important;
    }
  `,

  properties: [
    {
      name: 'onClose',
      class: ''
    }
  ],

  methods: [
    function render() {
      const self = this;
      const current$ = this.slot(function (data, data$currentWizardlet, data$currentSection) {
        return data$currentSection?.createView() ?? this.E();
      })
      let actionsDetachable = foam.core.FObject.create();
      this.addClass()
        .add(current$)
        .add(this.slot(function (data$actionBar, data$currentWizardlet) {
          let actions = data$actionBar;
          if ( self.actionProvider ) {
            const prevIndex = actions.findIndex(a => a.name == 'goPrev');
            if ( prevIndex != -1 ) {
              actions = [...actions];
              const actionRef = this.ActionReference.create({
                action: actions[prevIndex],
                data: this.data
              });
              actionsDetachable.detach();
              actionsDetachable = foam.core.FObject.create();
              self.actionProvider.addAction(actionRef);
              actionsDetachable.onDetach(function () {
                self.actionProvider.removeAction(actionRef);
              });
              actions.splice(prevIndex, 1);
            }
          }
          return this.E()
            .addClass(self.myClass('flexButtons'))
            .forEach(actions.reverse(), function (action) {
              this.tag(action, { size: 'LARGE' });
            });
        }))
        ;
    },
  ]
});
