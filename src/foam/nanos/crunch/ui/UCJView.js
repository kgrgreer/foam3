/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

 foam.CLASS({
  package: 'foam.nanos.crunch.ui',
  name: 'UCJView',
  extends: 'foam.u2.View',

  imports: [
    'approvalRequestDAO',
    'crunchController',
    'notify',
    'pushMenu',
    'stack',
    'translationService',
    'userDAO'
  ],

  requires: [
    'foam.dao.AbstractDAO',
    'foam.log.LogLevel',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.Subject',
    'foam.u2.ControllerMode',
    'foam.u2.crunch.wizardflow.SaveAllAgent',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.u2.wizard.StepWizardConfig'
  ],

  css: `
    ^ {
      padding-bottom: 0px !important;
    }
    ^stack-container .foam-u2-stack-StackView {
      padding-left: 0px !important;
    }
    ^ .foam-u2-wizard-ScrollingStepWizardView {
      height: auto;
    }
    ^ .foam-u2-wizard-ScrollingStepWizardView-fix-grid {
      height: calc(100vh - 163px) !important;
    }
  `,

  messages:[
    { name: 'BACK_LABEL', message: 'Back'},
    { name: 'SUCCESS_UPDATED', message: 'Data successfuly updated'},
    { name: 'SUCCESS_REMOVED', message: 'Data successfuly removed'}
  ],

  properties: [
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.u2.crunch.EasyCrunchWizard'
    }
  ],

  methods: [
    async function initE() {
      var user = await this.userDAO.find(this.data.effectiveUser);
      var realUser = await this.userDAO.find(this.data.sourceId);
      var subject = this.Subject.create({ user: user, realUser: realUser });
      var stack = this.Stack.create();
      var x = this.__subContext__.createSubContext({ stack: stack, subject: subject, controllerMode: this.ControllerMode.EDIT });

      var sequence = this.crunchController.createWizardSequence(this.data.targetId, x);
      this.config.applyTo(sequence);
      sequence
        .reconfigure('LoadCapabilitiesAgent', {
          subject: subject })
        .reconfigure('ConfigureFlowAgent', {
          popupMode: false
        })
        .remove('LoadTopConfig')
        .remove('RequirementsPreviewAgent')
        .remove('SkipGrantedAgent')
        .remove('WizardStateAgent')
        .remove('AutoSaveWizardletsAgent')
        .remove('PutFinalJunctionsAgent')
        .add(this.SaveAllAgent, { onSave: this.onSave.bind(this) })
        .execute();
       
        //add back button and 'View Reference' title
        this.addClass(this.myClass())
          .startContext({ data: this })
            .tag(this.BACK, {
              buttonStyle: foam.u2.ButtonStyle.LINK,
              themeIcon: 'back',
              label: this.BACK_LABEL
            })
          .endContext()
          .addClass(this.myClass('stack-container'))
            .tag(this.StackView.create({ data: stack, showActions: false }, x))
    },
    async function onSave(isValid, ucj) {
      if ( isValid && ucj.status != foam.nanos.crunch.CapabilityJunctionStatus.ACTION_REQUIRED ) {
        this.notify(this.SUCCESS_UPDATED, '', this.LogLevel.INFO, true);
        this.stack.back();
      }
      else {
        let { rejectOnInvalidatedSave, approval } = this.config;
        if ( rejectOnInvalidatedSave && approval ) {
          let rejectedApproval = approval.clone();
          rejectedApproval.status = this.ApprovalStatus.REJECTED;
          rejectedApproval.memo = 'Outdated Approval.';
          this.approvalRequestDAO.put(rejectedApproval).then(o => {
            this.approvalRequestDAO.cmd(this.AbstractDAO.RESET_CMD);
            this.notify(this.SUCCESS_REMOVED, '', this.LogLevel.INFO, true);
            this.pushMenu('approvals', true);
          }, e => {
            this.notify(e.message, '', this.LogLevel.ERROR, true);
          });
        }
        else {
          this.notify(this.SUCCESS_REMOVED, '', this.LogLevel.INFO, true);
          this.stack.back();
        }
      }
    }
  ],
  
  actions: [
    {
      name: 'back',
      code: function() {
        this.stack.back();
      }
    }
  ]
});
