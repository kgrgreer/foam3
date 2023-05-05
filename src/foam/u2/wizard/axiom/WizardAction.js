/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.axiom',
  name: 'WizardAction',
  extends: 'foam.core.Action',
  documentation: `
    Creates a distinction for actions that belong to a wizardlet but should
    display at the bottom of a wizard rather than within the wizardlet.
  `,
  properties: [
    {
      name: 'message',
      type: 'String'
    },
    {
      name: 'code',
      value: function (slot, X) {
        if (X.message)
          slot.analyticsAgent?.pub('event', {
            name: X.message,
            tags: ['wizard']
          });
        const wizardController = slot.data$.get();
        wizardController.goNext();
      }
    },
    {
      name: 'isEnabled',
      value: function (canGoNext, isLoading_) {
        return canGoNext && ! isLoading_;
      }
    }
  ],
  methods: [
    function toE(args, X) {
      var view = foam.u2.ViewSpec.createView(this.view, {
        ...(args || {}),
        action: this
      }, this, X);

      if ( X.data$ && ! ( args && ( args.data || args.data$ ) ) ) {
        view.data$ = X.data$;
      }

      return view;
    }
  ]
});
