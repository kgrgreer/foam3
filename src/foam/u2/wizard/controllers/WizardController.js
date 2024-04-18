/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.controllers',
  name: 'WizardController',

  issues: [
    'is title used still?'
  ],

  imports: [
    'developerMode',
    'handleEvent?',
    'analyticsAgent?'
  ],

  exports: ['as data'],

  requires: [
    'foam.core.FObject',
    'foam.u2.wizard.WizardPosition',
    'foam.u2.wizard.WizardStatus',
    'foam.u2.wizard.WizardletIndicator',
    'foam.u2.wizard.StepWizardConfig',
    'foam.u2.wizard.debug.WizardInspector',
    'foam.u2.wizard.event.WizardEvent',
    'foam.u2.wizard.event.WizardErrorHint',
    'foam.u2.wizard.event.WizardEventType'
  ],

  properties: [
    {
      class: 'String',
      name: 'title'
    },
    {
      class: 'Enum',
      name: 'status',
      of: 'foam.u2.wizard.WizardStatus',
      value: 'IN_PROGRESS',
      postSet: function (o, n) {
        if ( o != n ) this.analyticsAgent?.pub('event', { name: 'WIZARD_STATUS_' + n });
      }
    },
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.StepWizardConfig',
      documentation: `
        Configuration for the wizard. Some configurattion properties are not
        applicable to all wizard views.
      `,
      factory: function() {
        return this.StepWizardConfig.create();
      }
    },
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.Wizardlet',
      documentation: `
        An array containing all the wizardlets to use in this wizard. This may
        include wizardlets with isAvailable initially set to false.
      `
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'defaultView',
      expression: function(showTitle) {
        return {
          class: 'foam.u2.wizard.views.FocusWizardView',
          showTitle: showTitle
        }
      }
    },
    {
      name: 'wsub',
      class: 'FObjectProperty',
      of: 'FObject',
      description: `
        Subscription for listeners of wizardlets' state. This is replaced if the
        list of wizardlets is updated.
      `
    },
    {
      class: 'Function',
      name: 'onClose'
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'view',
      documentation: `
        Represents the desired view to render the current wizard contents.
        Form subclasses can choose how they want to use this.
      `,
      value: {
        class: 'foam.u2.borders.NullBorder'
      }
    },
    {
      name: 'submitted',
      class: 'Boolean',
      deprecated: true,
      documentation: 'true if this.status is COMPLETED',
      expression: function (status) {
        return status == this.WizardStatus.COMPLETED;
      }
    },
    {
      name: 'allValid',
      class: 'Boolean'
    },
    {
      name: 'someFailures',
      class: 'Boolean'
    },
    {
      class: 'Boolean',
      name: 'autoPositionUpdates',
      value: true
    },
    {
      name: 'lastException',
      documentation: `
        As most wizard exceptions will originate from DOM events (i.e. button
        clicks), this property will be updated to propagate errors back to
        StepWizardAgent, and also allow views to react.
      `
    },
    {
      class: 'Map',
      name: 'actionExtras',
      factory: () => ({})
    }
  ],

  methods: [
    function init() {
      this.analyticsAgent?.pub('event', { name: 'WIZARD_STATUS_' + this.status });
    },
    async function setFirstPosition() {
      // noop
    },
    function detach() {
      this.wsub.detach();
      this.SUPER();
    }
  ],

  actions: [
    {
      name: 'openWizardInspector',
      isAvailable: function (developerMode) { return developerMode },
      code: function(x) {
        this.WizardInspector.OPEN({}, this.__subContext__.createSubContext({
          wizardController: this
        }));
      }
    }
  ],

});
