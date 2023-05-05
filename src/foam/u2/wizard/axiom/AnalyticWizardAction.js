/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
  
 foam.CLASS({
    package: 'foam.u2.wizard.axiom',
    name: 'AnalyticWizardAction',
    extends: 'foam.u2.wizard.axiom.WizardAction',
  
    documentation: 'WizardAction with analytic events',
  
    imports: [
      'analyticsAgent?'
    ],

    properties: [
			{
				name: 'message',
				type: 'String'
			},
    	{
    	  name: 'code',
    	  value: function (slot, X) {
    	    analyticsAgent?.pub('event', {
    	      name: X.message,
    	      tags: ['wizard']
    	    });
    	    const wizardController = slot.data$.get();
    	    wizardController.goNext();
    	  }
    	  },
    ]
  });
  