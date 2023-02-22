/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.controllers',
  name: 'IncrementalWizardController',
  extends: 'foam.u2.wizard.controllers.WizardController',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.wizard.DynamicActionWizardlet',
    'foam.u2.wizard.WizardStatus',
    'foam.u2.wizard.axiom.WizardAction'
  ],

  implements: ['foam.u2.Progressable'],

  issues: [
    'should not depend on legacy controller'
  ],

  messages: [
    { name: 'ERROR_MSG', message: 'Information was not successfully submitted, please try again later' },
  ],

  properties: [
    {
      name: 'data',
      documentation: 'legacy controller',
      postSet: function (_, v) {
        this.currentWizardlet$ = v.currentWizardlet$;
        this.currentSection$ = v.currentSection$;
        // Remove when legacy controller is removed
        if ( foam.u2.Progressable.isInstance(v) ) {
          this.progressMax$ = v.progressMax$;
          this.progressValue$ = v.progressValue$;
        }

        // Listen for external actions completing the wizard
        this.onDetach(v.status$.sub(() => {
          if ( v == this.WizardStatus.IN_PROGRESS ) return;
          this.onClose({ completed: v.status == this.WizardStatus.COMPLETED });
        }))

      }
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
    'currentWizardlet',
    'currentSection',
    {
      name: 'backDisabled',
      class: 'Boolean',
      value: false
    },
    {
      class: 'Boolean',
      name: 'showTitle',
      value: true
    },
    {
      class: 'Boolean',
      name: 'discardAvailable'
    },
    {
      class: 'Boolean',
      name: 'isLoading_',
      documentation: `Condition to synchronize code execution and user response.`,
      value: false
    },
    {
      class: 'FObjectArray',
      of: 'foam.core.Action',
      name: 'actionBar',
      getter: function () {
        const currentWizardlet = this.currentWizardlet;

        let wizardletActions = [];
        if ( this.DynamicActionWizardlet.isInstance(currentWizardlet) && currentWizardlet.dynamicActions?.length ) {
          wizardletActions = currentWizardlet.dynamicActions;
        } else {
          wizardletActions = currentWizardlet.cls_.getAxiomsByClass(this.WizardAction);
        }

        let goNextAction = this.GO_NEXT;
        let goPrevAction = this.GO_PREV;
        const actionBar = [];

        for ( let action of wizardletActions ) {
          if ( action.name === 'goNext' ) {

            // If the class matches we can copy the original NEXT action
            // Using "Action.isInstance" is not appropriate here because
            // this approach doesn't work for subclasses.
            if ( action.cls_ == foam.core.Action ) {
              goNextAction = this.GO_NEXT.clone().copyFrom(action);
              goNextAction.buttonStyle = 'PRIMARY';
              continue;
            }

            goNextAction = action;
            goNextAction.buttonStyle = 'PRIMARY';

            // Copy defaults from original NEXT action
            const copyProperties = ['isAvailable', 'isEnabled'];
            for ( const k of copyProperties ) {
              if ( ! goNextAction[k] ) goNextAction[k] = this.GO_NEXT[k];
            }
            continue;
          }
          if ( action.name === 'goPrev' ) {
            goPrevAction = action;
            goPrevAction.buttonStyle = 'PRIMARY';
            const copyProperties = ['isAvailable', 'isEnabled', 'themeIcon', 'icon'];
            for ( const k of copyProperties ) {
              if ( ! goPrevAction[k] ) goPrevAction[k] = this.GO_PREV[k];
            }
            continue;
          }
          actionBar.push(action);
        }
        if ( this.discardAvailable ) {
          // ???: could let wizardlets override this one too
          actionBar.push(this.DISCARD);
        }
        actionBar.push(goPrevAction, goNextAction);


        return actionBar;
      }
    }
  ],

  methods: [
    async function setFirstPosition() {
      // Auto-next if first wizardlet is invisible
      if ( ! this.data.canLandOn(this.data.wizardPosition) ) {
        await this.data.tryWizardletLoad(this.data.currentWizardlet, this.data.wizardPosition);
        await this.data.next();
      }
    }
  ],

  actions: [
    {
      name: 'saveAndClose',
      label: 'Save and exit',
      code: function(x) {
        this.data.saveProgress().then(() => {
          this.onClose({});
        }).catch(e => {
          console.error(e);
          try {
            x.ctrl.notify(this.ERROR_MSG_DRAFT, '', this.LogLevel.ERROR, true);
          } catch (eNotify) {
            console.error('ctrl.notify failed!', eNotify);
          }
        });
      }
    },
    {
      name: 'discard',
      icon: 'images/ic-cancelblack.svg',
      isAvailable: function (discardAvailable) { return discardAvailable; },
      code: function () {
        this.data.discard();
      }
    },
    {
      name: 'goPrev',
      label: 'Back',
      icon: 'images/arrow-back-24px.svg',
      isEnabled: function (isLoading_) {
        return ! isLoading_;
      },
      isAvailable: function (data$canGoBack, backDisabled) {
        return ! backDisabled && data$canGoBack;
      },
      code: function() {
        this.data.back();
      }
    },
    {
      name: 'goNext',
      label: 'Next',
      buttonStyle: 'PRIMARY',
      isEnabled: function (data$canGoNext, isLoading_) {
        return data$canGoNext && ! isLoading_;
      },
      isAvailable: function (isLoading_) {
        return ! isLoading_;
      },
      code: function(x) {
        this.isLoading_ = true;
        this.data.next().then((isFinished) => {
          if ( isFinished ) {
            for ( let w of this.data.wizardlets ) {
              if ( w.submit ) w.submit();
            }
          }
        }).catch(e => {
          console.error(e);
          try {
            x.ctrl.notify(this.ERROR_MSG, '', this.LogLevel.ERROR, true);
          } catch (eNotify) {
            console.error('ctrl.notify failed!', eNotify);
          }
        }).finally(() => {
          this.isLoading_ = false;
        });
      }
    }
  ]
});
