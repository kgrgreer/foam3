/**
* @license
* Copyright 2023 The FOAM Authors. All Rights Reserved.
* http://www.apache.org/licenses/LICENSE-2.0
*/

foam.CLASS({
  package: 'foam.u2.wizard.axiom',
  name: 'GoToMenuAction',
  extends: 'foam.u2.wizard.axiom.WizardAction',

  documentation: `
   WizardAction that allows implementing wizardlets to push to a new menu onSubmit, 
   If no menu is defined, the default menu is pushed
  `,

  imports: ['ctrl'],

  messages: [
    { name: 'GO_TO', message: 'Go to' }
  ],

  properties: [
    ['name', 'goToMenu'],
    {
      class: 'Reference',
      name: 'menu',
      of: 'foam.nanos.menu.Menu',
      documentation: 'Optional argument used to menu to push, if left empty, default menu is pushed'
    },
    {
      name: 'code',
      value: function(x, action) {
        var wizardController = x.data$.get();
        let temp = wizardController.onClose;
        wizardController.onClose = function() {
          // Maybe make forcepush a prop
          x.pushMenu?.(action.menu, true);
          return temp?.call(wizardController);
        }
        wizardController.goNext();
      }
    },
    {
      class: 'Object',
      name: 'label',
      factory: function() {
        /* ignoreWarning */ 
        if ( this.menu ) {
          return Promise.resolve(`${this.GO_TO} ${this.menu.label}`);
        }
        return this.ctrl.findDefaultMenu(this.__subContext__.menuDAO).then(v => `${this.GO_TO} ${v.label}`);
      }       
    }
  ]
});
