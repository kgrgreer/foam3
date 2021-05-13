/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'UCJReferenceView',
  extends: 'foam.u2.View',
  documentation: `
    Render the UCJ specified by 'data' in an inline CRUNCH wizard. The default
    WAO setting is APPROVAL, which means UCJ changes will generate approvals
    instead of updating UCJs directly.
  `,

  imports: [
    'crunchController',
    'userCapabilityJunctionDAO'
  ],

  requires: [
    'foam.u2.crunch.wizardflow.LoadCapabilitiesAgent',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView'
  ],

  css: `
    ^ .foam-u2-stack-StackView {
      padding-left: 0px !important;
    }
  `,

  properties: [
    {
      name: 'localStack',
      factory: function () {
        return this.Stack.create();
      }
    }
  ],

  methods: [
    async function initE() {
      this
        .addClass(this.myClass())
        .tag(this.StackView.create({
          data: this.localStack,
          showActions: false
        }));

      var ucj = (
        await this.userCapabilityJunctionDAO.where(this.data).select()
      ).array[0];
      var subject = await ucj.getSubject();
      var x = this.__subContext__.createSubContext({
        stack: this.localStack,
        subject: subject
      });
      
      this.crunchController.createWizardSequence(ucj.targetId, x)
        .reconfigure('LoadCapabilitiesAgent', {
          subject: subject,
          waoSetting: this.LoadCapabilitiesAgent.WAOSetting.APPROVAL
        })
        .reconfigure('ConfigureFlowAgent', {
          popupMode: false
        })
        .remove('LoadTopConfig')
        .remove('RequirementsPreviewAgent')
        .remove('SkipGrantedAgent')
        .remove('WizardStateAgent')
        .execute();
    }
  ]
});
