/**
 * @license
 * Copyright 2023 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.crunch',
  name: 'WizardRunner',
  imports: ['crunchController'],
  issues: [
    'when source is a capability it should create a WizardFlow'
  ],
  requires: [
    'foam.u2.wizard.WizardType',
    'foam.u2.wizard.wizardflow.WizardFlow'
  ],
  properties: [
    {
      class: 'Enum',
      of: 'foam.u2.wizard.WizardType',
      name: 'wizardType'
    },
    {
      name: 'source',
      documentation: `
        Either a capability, string, or WizardFlow
      `
    }
  ],
  methods: [
    async function launch(x, options) {
      options = options || {};
      x = x || this.__context__;

      const IN_PROGRESS = this.crunchController.WizardStatus.IN_PROGRESS;

      const parentWizard = this.getParentWizard_();
      const isInline = (options.inline ?? true) && !! parentWizard;

      const seq = this.getSequence_(x, isInline);

      // wizardContext
      // - Is returned to places a wizard is instantiated
      // - Contains the instantiated wizardlets (note: just the instantiated - not parentWizard)
      let wizardContext = undefined;
      // If there is intention is to inject wizard and is there an open wizard...
      if ( isInline ) {
        // returnPromise - waits for a resolve, prior to continuing through to a return
        let returnPromise = Promise.resolve();
        // promise$ -> acts as flag for resolving returnPromise after user finishes
        // the last wizardlet (onLastWizardletSaved), and only if
        // call to WizardRunner came with options.returnCompletionPromise = true
        let promise$ = foam.core.SimpleSlot.create({ value: false }, this);
        if ( options.returnCompletionPromise ) {
          returnPromise = new Promise(rslv => {
            promise$.sub(v => {
              if ( v ) rslv();
            });
          });
        }
        wizardContext = await this.crunchController.inlineWizardFromSequence(
          parentWizard,
          seq, 
          (options.returnCompletionPromise ? { onLastWizardletSaved: () => promise$.set(true) } : {})
        );
        await returnPromise;
      } else {
        wizardContext = await seq.execute();
      }

      return wizardContext;
    },
    function launchNotInline_ () {
      const seq = this.sequenceFromWizardType_();
    },
    function getParentWizard_ () {
      const lastWizard = this.crunchController.lastActiveWizard;
      if ( ! lastWizard ) return null;
      if ( lastWizard.status !== this.crunchController.WizardStatus.IN_PROGRESS ) {
        return null;
      }
      return lastWizard;
    },
    function getSequence_ (x, isInline) {
      if ( ! this.WizardFlow.isInstance(this.source) ) {
        return this.getSequenceFromCapability_(x, isInline);
      }

      if ( isInline ) {
        return this.crunchController.toWizardFlowSequence(
          this.crunchController.createInlineWizardSequence(x)
        ).add(this.source);
      }

      return this.crunchController.createWizardFlowSequence(x)
        .addBefore('ShowPreexistingAgent', this.source);
    },
    function getSequenceFromCapability_ (x, isInline) {
      const wizardType = this.wizardType;

      if ( isInline && wizardType == this.WizardType.UCJ ) {
        const seq = this.crunchController.createUCJInlineWizardSequence(x);
        seq.addBefore('CapabilityAdaptAgent', {
          class: 'foam.u2.wizard.agents.RootCapabilityAgent',
          rootCapability: this.source
        });
        return seq;
      }

      if ( ! isInline && wizardType == this.WizardType.UCJ ) {
        return this.crunchController
          .createTransientWizardSequence(this.__subContext__)
          .addBefore('ConfigureFlowAgent', {
            class: 'foam.u2.wizard.agents.RootCapabilityAgent',
            rootCapability: this.source
          })
          .reconfigure('WAOSettingAgent', {
            waoSetting: foam.u2.crunch.wizardflow.WAOSettingAgent.WAOSetting.UCJ
          })
          .remove('RequirementsPreviewAgent')
      }

      if ( wizardType == this.WizardType.TRANSIENT ) {
        return this.crunchController
          .createTransientWizardSequence(this.__subContext__)
          .addBefore('ConfigureFlowAgent', {
            class: 'foam.u2.wizard.agents.RootCapabilityAgent',
            rootCapability: this.source
          })
          .reconfigure('WAOSettingAgent', {
            waoSetting: foam.u2.crunch.wizardflow.WAOSettingAgent.WAOSetting.CAPABLE
          })
          .remove('RequirementsPreviewAgent')
      }
      console.error(
        '%cAre you configuring a new wizard?%c%s',
        'color:red;font-size:30px', '',
        'you need to add explicit support for ' +
          (isInline ? 'inline-' : '')+wizardType.name +
          ' wizards in WizardRunner.js; ' +
          'or wait for Eric to finish refactoring sequences'
      );
      throw new Error('getSequence_ has no implementation for this', {
        isInline, wizardType
      });
    }
  ]
});
