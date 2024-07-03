/**
 * @license
 * Copyright 2024 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch.wizardflow',
  name: 'RequestNotificationPermissionAgent',
  implements: [ 'foam.core.ContextAgent' ],
  documentation: `
    Requests user for push notification permissions based on a predicate. Does nothing if already granted on device.
  `,

  imports: ['pushRegistryAgent', 'wizardController?'],

  requires: [
    'foam.u2.dialog.StyledModal'
  ],

  classes: [
    {
      name: 'RequestPermissionView',
      extends: 'foam.u2.View',
      imports: ['pushRegistryAgent'],
      messages: [
        { name: 'PERMISSION_REASON', message: 'We use your on device notifications to improve the overall experience by allowing us to update you about your transaction status, latest rates & exciting promotions. Please click the button below to allow notifications to receive these updates. You can also enable notifications later from settings. ' }
      ],
      css: `
        ^ {
          color: $grey600;
          display: flex;
          flex-direction: column;
          gap: 2.4rem;
        }
        ^buttons {
          display: flex;
          flex-direction: column;
          gap: 1.2rem;
          width: 100%;
        }
      `,
      
      properties: [
        {
          class: 'String',
          name: 'prefix'
        },
        {
          class: 'Boolean',
          name: 'dontShowAgain',
          help: 'Do not show this again'
        }
      ],
      methods: [
        function render() {
          this
          .addClass('p-md', this.myClass())
          .start().add(this.prefix).end()
          .start().add(this.PERMISSION_REASON).end()
          .startContext({ controllerMode: 'EDIT', data: this })
            .start().add(this.DONT_SHOW_AGAIN).end()
            .start()
              .addClass(this.myClass('buttons'))
              .tag(this.ALLOW_NOTIFICATIONS)
              .tag(this.NOT_NOW)
            .end()
          .endContext();
        }
      ],
      actions: [
        {
          name: 'allowNotifications',
          buttonStyle: 'PRIMARY',
          code: async function(X) {
            X.closeDialog();
            await X.pushRegistryAgent.requestNotificationPermission();
          }
        },
        {
          name: 'notNow',
          buttonStyle: 'TEXT',
          code: function(X) {
            if ( this.dontShowAgain )
              localStorage.setItem('refusedNotification', true);
            X.closeDialog();
          }
        }
      ]
    }
  ],

  css: `
    ^ .foam-u2-dialog-StyledModal-modal-body {
      color: $grey600;
      display: flex;
      flex-direction: column;
      gap: 2.4rem;
    }
  `,

  properties: [
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'String',
      name: 'desc',
      documentation: 'Useful for displaying context about why this agent got executed (eg. due to sign up/completing a flow)'
    },
    'popup'
  ],

  methods: [
    async function execute(x) {
      // If the wizard didnt complete, return
      if ( this.wizardController && this.wizardController.status != 'COMPLETED' ) return;
      // If this agent ever needs to enable or disable this behaviour for the user it should start using a capability to render this view, but for now, this is per device so it doesnt
      let currentState = await this.pushRegistryAgent.currentState;
      if ( currentState != 'DEFAULT' || ! this.pushRegistryAgent.supportsNotifications || localStorage.getItem('refusedNotification') ) return;

      this.popup = this.StyledModal.create({ title$: this.title$, closeable: false }).tag(this.RequestPermissionView, { prefix$: this.desc$ });
      this.popup.open();

      return;
    }
  ]
});
