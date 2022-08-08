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
      padding-bottom: 3.2rem;
    }
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
        // Render current wizard section
        .add(current$)
        // Render actions
        // Why dont we do this in FocusWizardForm?
        .add(this.slot(function (data$actionBar, data$currentWizardlet) {
          let actions = data$actionBar;

          // avoid mutating the reported action bar
          actions = [...actions];

          // When the slot listener updates this object will be detached
          actionsDetachable.detach();
          actionsDetachable = foam.core.FObject.create();

          if ( self.actionProvider ) {
            // Control over rendering these actions will be given to the
            // action provider - usually the popup header.
            const prevIndex = actions.findIndex(a => a.name == 'goPrev');
            if ( prevIndex != -1 ) {
              actions = [...actions];
              const actionRef = this.ActionReference.create({
                action: actions[prevIndex],
                data: this.data
              });

              self.actionProvider.addAction(actionRef);
              actionsDetachable.onDetach(function () {
                self.actionProvider.removeAction(actionRef);
              });
              actions.splice(prevIndex, 1);
            }
            const discardIndex = actions.findIndex(a => a.name == 'discard');
            if ( discardIndex != -1 ) {
              self.actionProvider.closeAction = this.ActionReference.create({
                action: actions[discardIndex],
                data: this.data
              });
              actions.splice(discardIndex, 1);
            }
          }

          // Listen to availability of actions that FlexibleWizardContentsView
          //   still has rendering control over to decide if the container
          //   is visible
          let slots = [];
          actions.forEach(a => {
            slots.push(a.createIsAvailable$(self.__subContext__, self.data));
          });
          let s = foam.core.ArraySlot.create({ slots: slots }, self);
          let anyAvailable = this.slot(function(slots) {
            for ( let slot of slots ) {
              if ( slot ) return true;
            }
            return false;
          }, s);

          // Render action buttons
          return this.E()
            .addClass(self.myClass('flexButtons'))
            .show(anyAvailable)
            // WARNING!!!
            // Export the current wizardlet section view in context so that dynamicActions can use it
            // this only works for incremental wizard, we will need a better solution for wizards that 
            // render multiple sections at once
            .startContext({ currentWizardletSectionView: current$ })
            .forEach(actions.reverse(), function (action) {
              this.tag(action, {
                size: 'LARGE',
                label: self.data.currentWizardlet.actionLabel || action.label
              });
            }).endContext();
        }))
        ;
    },
  ]
});
