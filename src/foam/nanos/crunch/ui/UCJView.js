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
    'capabilityDAO',
    'crunchController',
    'notify',
    'pushMenu',
    'stack',
    'tableViewApprovalRequestDAO',
    'translationService',
    'userDAO'
  ],

  documentation: `
  To use the UCJView for a custom set of capabilities : should set the following properties:
    this.UCJView.create({
      isSettingCapabilities: // true,
      data: // need to set a ucj such that wizard extracts subject from
      mode: this.mode, // seems to want to be ControllerMode - however not clear why this is here
      capabilitiesList: // Set Custom Capability list
    });
  `,

  requires: [
    'foam.log.LogLevel',
    'foam.nanos.approval.ApprovalStatus',
    'foam.nanos.auth.Subject',
    'foam.nanos.crunch.CapabilityJunctionStatus',
    'foam.u2.ControllerMode',
    'foam.u2.DisplayMode',
    'foam.u2.crunch.EasyCrunchWizard',
    'foam.u2.crunch.wizardflow.ConfigureFlowAgent',
    'foam.u2.crunch.wizardflow.CapabilityAdaptAgent',
    'foam.u2.crunch.wizardflow.LoadCapabilitiesAgent',
    'foam.u2.crunch.wizardflow.CreateWizardletsAgent',
    'foam.u2.crunch.wizardflow.FilterGrantModeAgent',
    'foam.u2.crunch.wizardflow.LoadWizardletsAgent',
    'foam.u2.crunch.wizardflow.StepWizardAgent',
    'foam.u2.crunch.wizardflow.DetachAgent',
    'foam.u2.crunch.wizardflow.SpinnerAgent',
    'foam.u2.crunch.wizardflow.SaveAllAgent',
    'foam.u2.crunch.wizardflow.SubmitAgent',
    'foam.u2.crunch.wizardflow.DetachSpinnerAgent',
    'foam.u2.crunch.wizardflow.CapabilityStoreAgent',
    'foam.u2.crunch.wizardflow.WAOSettingAgent',
    'foam.u2.stack.Stack',
    'foam.u2.stack.StackView',
    'foam.u2.wizard.StepWizardConfig',
    'foam.util.async.Sequence'
  ],

  css: `
    ^ {
      padding-bottom: 0px;
    }
    ^stack-container .foam-u2-stack-StackView {
      padding-left: 0px;
    }
    ^ .foam-u2-wizard-ScrollingStepWizardView {
      height: auto;
    }
    ^ .foam-u2-wizard-ScrollingStepWizardView-fix-grid {
      height: calc(100vh - 163px);
    }
  `,

  messages: [
    { name: 'BACK_LABEL', message: 'Back'},
    { name: 'SUCCESS_UPDATED', message: 'Data successfuly updated'},
    { name: 'SUCCESS_REMOVED', message: 'Data successfuly removed'}
  ],

  properties: [
    {
      name: 'config',
      class: 'FObjectProperty',
      of: 'foam.u2.crunch.EasyCrunchWizard',
      factory: function () {
        return this.EasyCrunchWizard.create();
      }
    },
    {
      name: 'capabilitiesList',
      class: 'FObjectArray',
      of: 'foam.nanos.crunch.Capability'
    },
    {
      name: 'isSettingCapabilities',
      class: 'Boolean',
      documentation: `If passing in a set of capabilites to open,
      then this is true and the wizard sequence is different.
      Otherwise we assume a rootCapability is instantiating this flow
      and thus a different wizard sequence.`
    }
  ],

  methods: [
    async function render() {
      var user = undefined;
      var realUser = await this.userDAO.find(this.data.sourceId);
      if ( this.data.effectiveUser ) {
        user = await this.userDAO.find(this.data.effectiveUser);
      }
      if ( ! user ) user = realUser;
      var subject = this.Subject.create({ user: user, realUser: realUser });
      var stack = this.Stack.create();
      var x = this.__subContext__.createSubContext({
        stack: stack,
        subject: subject,
        controllerMode:
          this.mode == this.DisplayMode.RW
            ? this.ControllerMode.EDIT
            : this.ControllerMode.VIEW
      });
      var sequence = undefined;
      if ( this.isSettingCapabilities ) {
        x = x.createSubContext({
          capabilities: this.capabilitiesList
        });
        sequence = this.Sequence.create(null, x)
        .add(this.ConfigureFlowAgent, { popupMode: false })
        .add(this.WAOSettingAgent)
        .add(this.CreateWizardletsAgent)
        .add(this.LoadWizardletsAgent)
        .add(this.StepWizardAgent)
        .add(this.DetachAgent)
        .add(this.SpinnerAgent)
        .add(this.SaveAllAgent)
        .add(this.SubmitAgent)
        .add(this.DetachSpinnerAgent)
        .add(this.CapabilityStoreAgent);
      } else {
        sequence = this.crunchController.createWizardSequence(this.data.targetId, x);
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
          .add(this.SaveAllAgent, { onSave: this.onSave.bind(this) });
      }
      this.config.applyTo(sequence);
      sequence.execute();


      // add back button and 'View Reference' title
      this.addClass()
        .startContext({ data: this })
          .tag(this.BACK, {
            buttonStyle: foam.u2.ButtonStyle.LINK,
            themeIcon: 'back',
            label: this.BACK_LABEL
          })
        .endContext()
        .addClass(this.myClass('stack-container'))
          .tag(this.StackView.create({ data: stack, showActions: false }, x));
    },
    async function onSave(isValid, ucj) {
      if ( isValid && ucj.status != this.CapabilityJunctionStatus.ACTION_REQUIRED ) {
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
            this.approvalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
            this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.RESET_CMD);
            this.approvalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
            this.tableViewApprovalRequestDAO.cmd(foam.dao.DAO.PURGE_CMD);
            
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
