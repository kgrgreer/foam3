/**
 * @license
 * Copyright 2021 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard',
  name: 'StepWizardController',

  implements: ['foam.u2.Progressable'],

  imports: [
    'developerMode',
    'handleEvent?'
  ],

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
      name: 'wsub',
      class: 'FObjectProperty',
      of: 'FObject',
      description: `
        Subscription for listeners of wizardlets' state. This is replaced if the
        list of wizardlets is updated.
      `
    },
    {
      name: 'wizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.Wizardlet',
      documentation: `
        An array containing all the wizardlets to use in this wizard. This may
        include wizardlets with isAvailable initially set to false.
      `,
      postSet: function (_, n) {
        this.setupWizardletListeners(n);
        this.determineWizardActions(n);
      }
    },
    {
      name: 'wizardPosition',
      documentation: `
        A WizardPosition instance specifying the index of the wizardlet and
        section that is considered the "current" section. For the incremental
        view, this is the current screen; for the scrolling view, this is the
        first section that is below the top of the visible portion of the wizard.
      `,
      class: 'FObjectProperty',
      of: 'foam.u2.wizard.WizardPosition',
      factory: function() {
        return this.WizardPosition.create({
          wizardletIndex: 0,
          sectionIndex: 0,
        });
      },
      preSet: function(o, n) {
        if ( n?.wizardletIndex != o?.wizardletIndex )
          this.wizardlets[n.wizardletIndex].load({});
        return n;
      },
      postSet: function (o, n) {
        if ( o && n && o.wizardletIndex !== n.wizardletIndex ) {
          this.wizardlets[o.wizardletIndex].isCurrent = false;
          this.wizardlets[n.wizardletIndex].isCurrent = true;
        }
        let a = this.wizardlets.slice(0, n?.wizardletIndex + 1);
        this.progressValue = a.filter(v => v.isVisible).length;
        this.activePosition = n;
      }
    },
    {
      name: 'activePosition',
      documentation: `
        Active position represents the wizardlet currently acting, which may
        not be a visible wizardlet and therefore will not always reflect the
        position of the visible wizardlet.
      `
    },

    {
      name: 'nextScreen',
      expression: function(wizardPosition) {
        return this.nextAvailable(wizardPosition);
      }
    },
    {
      name: 'previousScreen',
      expression: function(wizardPosition) {
        return this.nextAvailable(wizardPosition, true);
      }
    },
    {
      name: 'visitedWizardlets',
      class: 'FObjectArray',
      of: 'foam.u2.wizard.wizardlet.Wizardlet'
    },

    // Convenience properties
    {
      name: 'currentWizardlet',
      expression: function(wizardlets, wizardPosition) {
        var current = wizardlets[wizardPosition.wizardletIndex];
        if ( this.visitedWizardlets.indexOf(current) == -1 ) {
          this.visitedWizardlets.push(current);
        }
        return current;
      }
    },
    {
      name: 'currentSection',
      expression: function(
        wizardlets,
        wizardPosition$wizardletIndex, wizardPosition$sectionIndex
      ) {
        return wizardlets[wizardPosition$wizardletIndex]
          .sections[wizardPosition$sectionIndex];
      }
    },
    {
      name: 'isLastScreen',
      class: 'Boolean',
      expression: function(nextScreen) {
        return nextScreen == null;
      }
    },
    {
      name: 'canGoBack',
      class: 'Boolean',
      expression: function(previousScreen) {
        if ( previousScreen == null ) return false;

        // check for irreversible wizardlets between here and previous screen
        const { wizardPosition, wizardlets } = this;
        for ( let pos of wizardPosition.iterate(wizardlets, true) ) {
          if ( pos.wizardletIndex == wizardPosition.wizardletIndex ) continue;
          if ( pos.compareTo(previousScreen) < 0 ) break;
          if ( wizardlets[pos.wizardletIndex].irreversible ) return false;
        }

        return true;
      }
    },
    {
      name: 'canGoNext',
      class: 'Boolean',
      expression: function(
        wizardPosition, nextScreen,
        currentSection, currentWizardlet,
        currentSection$isValid, currentWizardlet$isValid,
        config$allowSkipping,
        currentWizardlet$isInAltFlow
      ) {
        if ( config$allowSkipping ) return true;
        if ( currentWizardlet$isInAltFlow ) return true;
        if (
          ! nextScreen ||
          wizardPosition.wizardletIndex != nextScreen.wizardletIndex
        ) {
          if ( ! currentWizardlet$isValid ) return false;
        }
        return currentSection$isValid || false;
      }
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
    function setupWizardletListeners(wizardlets) {
      console.debug('step wizard', this);

      if ( this.wsub ) this.wsub.detach();
      this.wsub = this.FObject.create();

      this.onWizardletValidity();

      wizardlets.forEach((w, wizardletIndex) => {

        // Bind availability listener for wizardlet availability
        var isAvailable$ = w.isAvailable$;
        this.wsub.onDetach(isAvailable$.sub(() => {
          this.onWizardletAvailability(wizardletIndex, isAvailable$.get());
        }));

        var isVisible$ = w.isVisible$;
        this.wsub.onDetach(isVisible$.sub(() => {
          this.onWizardletVisibility();
        }));

        // Bind availability listener for each wizardlet section
        w.sections.forEach((section, sectionIndex) => {
          var sectionPosition = this.WizardPosition.create({
            wizardletIndex: wizardletIndex,
            sectionIndex: sectionIndex,
          });
          var isAvailable$ = section.isAvailable$;
          this.wsub.onDetach(isAvailable$.sub(() => {
            this.onSectionAvailability(
              sectionPosition, isAvailable$.get());
          }));
        });

        // Bind validity listener for wizardlet validity
        var isValid$ = w.isValid$;
        this.wsub.onDetach(isValid$.sub(() => {
          this.onWizardletValidity();
        }));

        // Bind indicator listener for wizardlet validity
        var indicator$ = w.indicator$;
        this.wsub.onDetach(indicator$.sub(() => {
          this.onWizardletIndicator(wizardletIndex, indicator$.get());
        }));

      });

    },
    function determineWizardActions(wizardlets) {
      // TODO: If we ever need wizardlets to add new actions to the wizard,
      //       rather than just overriding existing ones, we can create a list
      //       of pseudo-actions here by iterating over all the wizardlets and
      //       finding axioms of type foam.u2.wizard.axiom.WizardAction.
    },
    function detach() {
      this.wsub.detach();
      this.SUPER();
    },
    function nextAvailable(pos, goBackwards) {
      if ( ! pos ) return null;

      const iterator = pos.iterate(this.wizardlets, goBackwards);
      for ( const p of iterator ) {
        let wizardlet = this.wizardlets[p.wizardletIndex]
        if ( ! wizardlet.isVisible ) continue;

        if (
          wizardlet.sections.length > 0 &&
          wizardlet.sections[p.sectionIndex].isAvailable
        ) return p;
      }

      return null;
    },
    function saveProgress() {
      return this.wizardlets.reduce((p, wizardlet) =>
        this.visitedWizardlets.indexOf(wizardlet) == -1 ? p
          : p.then(() => wizardlet.save()), Promise.resolve());
    },
    function canLandOn(pos) {
      const wizardlet = this.wizardlets[pos.wizardletIndex];
      if ( ! wizardlet.isVisible ) return false;
      if ( wizardlet.sections.length < 1 ) return false;
      const section = wizardlet.sections[pos.sectionIndex];
      if ( ! section.isAvailable ) return false;
      return true;
    },
    function debugLog (title, position, details) {
      const logger = console;

      logger.debug(`%c${title}: %c${position && position.toSummary() || '--'} %o`,
        "font-weight: bold",
        "color: #fc0373;",
        details || {}
      );
    },
    async function next(firstWizardletAlreadySaved) {
      const debugLog = this.debugLog.bind(this);

      let wizardlet      = this.currentWizardlet;
      let firstWizardlet = this.currentWizardlet;
      // if wizardlet.goNextOnSave if false, simply save the wizardlet and return
      // TODO: won't work if the wizardlet with goNextOnSave is sandwiched between invisible wizardlets
      // (i.e. we're in the loop below instead)
      if ( ! wizardlet.goNextOnSave ) {
        try {
          await wizardlet.save();
        } catch (e) {
          this.lastException = e;
          throw e;
        }
        return false;
      }

      const iterator = this.wizardPosition.iterate(this.wizardlets);

      let referencePosition = this.wizardPosition;

      while ( referencePosition ) {
        let wizardlet = this.wizardlets[referencePosition.wizardletIndex];
        let nextPosition = referencePosition.getNext(this.wizardlets);
        nextWizardlet = nextPosition && this.wizardlets[nextPosition.wizardletIndex];
        // if ( ! nextPositionWizardlet.isAvailable ) continue;

        // It is possible that 'referencePosition' and 'nextPosition' are
        // sections of the same wizardlet.
        const atWizardletBoundary = ! nextPosition || nextWizardlet != wizardlet;

        debugLog('analyzing wizard position', referencePosition, {
          atWizardletBoundary,
          nextWizardlet,
          nextPosition
        });
        
        // Not much to do between sections of the same wizardlet, just
        // land on one if it's available
        if ( ! atWizardletBoundary ) {
          if ( this.canLandOn(nextPosition) ) {
            debugLog('landing on section', referencePosition, {
              nextPosition
            });
            this.wizardPosition = nextPosition;
            return false;
          }

          referencePosition = referencePosition.getNext(this.wizardlets);
          continue;
        }

        try {
          debugLog('saving wizardlet', referencePosition, {
            wizardlet
          });
          if ( wizardlet != firstWizardlet || ! firstWizardletAlreadySaved ) await wizardlet.save();
        } catch (e) {
          let { exception, hint } = await wizardlet.handleException(
            this.WizardEventType.WIZARDLET_SAVE, e
          );

          if ( hint == this.WizardErrorHint.AWAIT_FURTHER_ACTION ) {
            if ( this.canLandOn(this.wizardPosition) ) return false;
            hint = this.WizardErrorHint.ABORT_FLOW;
          }

          if ( hint == this.WizardErrorHint.ABORT_FLOW ) {
            throw this.lastException = exception || e;
          }
        }

        this.onWizardletCompleted(wizardlet);
        this.activePosition = nextPosition;;

        // Re-calculate next position and next wizardlet
        // (in case an inline wizard was added while saving)
        nextPosition = referencePosition.getNext(this.wizardlets);
        nextWizardlet = nextPosition && this.wizardlets[nextPosition.wizardletIndex];
        if ( ! nextWizardlet ) break;

        // Load the next available wizardlets; ignore unavailable wizardlets
        while ( nextWizardlet && ! nextWizardlet.isAvailable ) {
          debugLog('skipping unavailable wizardlet', nextPosition, {
            wizardlet: nextWizardlet
          });
          nextPosition = nextPosition.getNext(this.wizardlets);
          nextWizardlet = nextPosition && this.wizardlets[nextPosition.wizardletIndex];
        }
        if ( ! nextWizardlet ) break;

        await this.tryWizardletLoad(nextWizardlet, nextPosition);

        if ( this.canLandOn(nextPosition) ) {
          console.debug(`%clanding: %c${nextPosition && nextPosition.toSummary()}`,
            "font-weight: bold",
            "color: #fc0373;");
          debugLog('landing on wizardlet', nextPosition);
          this.wizardPosition = nextPosition;
          return false;
        }

        referencePosition = nextPosition;
      }


      // try {
      //   await wizardlet.save();
      // } catch (e) {
      //   this.lastException = e;
      //   throw e;
      // }
      this.status = this.WizardStatus.COMPLETED;
      return true;
    },
    async function tryWizardletLoad(wizardlet, wizardletPosition) {
      try {
        this.debugLog('loading wizardlet', wizardletPosition, {
          wizardlet: wizardlet
        });
        await wizardlet.load();
      } catch (e) {
        let { exception, hint } = await wizardlet.handleException(
          this.WizardEventType.WIZARDLET_LOAD, e
        );

        if ( hint != this.WizardErrorHint.CONTINUE_AS_NORMAL ) {
          throw this.lastException = exception || e;
        }
      }
    },
    function back() {
      let previousScreen = this.previousScreen;
      if ( previousScreen == null ) {
        throw new Error('back() called without checking canGoBack');
      }
      this.wizardPosition = previousScreen;
    },
    function countAvailableSections(wizardletIndex) {
      return this.wizardlets[wizardletIndex].sections.filter(
        s => s.isAvailable).length;
    },
    function canSkipTo(pos) {
      var start = this.wizardPosition;
      var diff = pos.compareTo(this.wizardPosition);

      if ( diff == 0 ) return true;
      if ( this.nextScreen && pos.compareTo(this.nextScreen) == 0 )
        return this.canGoNext;
      if ( this.previousScreen && pos.compareTo(this.previousScreen) == 0 ) return this.canGoBack;
      if ( diff < 0 ) return this.allowBacktracking;
      if ( this.allowSkipping ) return true;

      // Iterate over each section along the way to make sure it's valid
      var lastWizardletIndex = start.wizardletIndex;
      for ( let p = start ; p != null ; p = p.getNext(this.wizardlets) ) {
        // Also check isValid on the wizardlet itself
        if ( p.wizardletIndex != lastWizardletIndex ) {
          if ( ! this.wizardlets[lastWizardletIndex].isValid ) {
            return false;
          }
        }
        if ( p.compareTo(pos) == 0 ) return true;
        let wizardlet = this.wizardlets[p.wizardletIndex];
        let section = this.wizardlets[p.sectionIndex];
      }
    },
    function skipTo(pos) {
      this.wizardPosition = pos;
    },
    function discard () {
      this.status = this.WizardStatus.DISCARDED;
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

  listeners: [
    {
      name: 'onWizardletAvailability',
      framed: true,
      code: function onWizardletAvailability(wizardletIndex, value) {
        if ( ! this.autoPositionUpdates ) return;
        // Force a position update so views recalculate state
        this.wizardPosition = this.wizardPosition.clone();
      },
    },
    {
      name: 'onWizardletVisibility',
      framed: true,
      code: function() {
        // Force a position update so views recalculate state
        this.progressMax = this.wizardlets?.filter(v => v.isVisible).length;
      },
    },
    function onWizardletValidity() {
      this.allValid = this.wizardlets.filter(w => ! w.isValid).length == 0;
    },
    function onWizardletIndicator(wizardletIndex, value) {
      if ( value == this.WizardletIndicator.NETWORK_FAILURE ) {
        this.someFailures = true;
        return;
      }
      this.someFailures = !! this.wizardlets.filter(
        w => w.indicator == this.WizardletIndicator.NETWORK_FAILURE).length;
    },
    function onSectionAvailability(sectionPosition, value) {
      if ( ! this.autoPositionUpdates ) return;
      // If a previous position became available, move the wizard back
      if ( value && sectionPosition.compareTo(this.wizardPosition) < 0 ) {
        this.wizardPosition = sectionPosition;
        return;
      }

      // Trigger "next screen" if the current wizard position is gone
      if ( ! value && sectionPosition.compareTo(this.wizardPosition) == 0 ) {
        this.wizardPosition = this.nextScreen;
        return;
      }

      // Force position update anyway so views recalculate state
      this.wizardPosition = this.wizardPosition.clone();
    },
    function onWizardletCompleted(wizardlet) {
      try {
        if ( ! this.handleEvent ) return;
        this.handleEvent(this.WizardEvent.create({
          wizardlet,
          eventType: this.WizardEventType.WIZARDLET_SAVE
        }));
      } catch (e) {
        // report analytics error without interrupting flow
        console.error('analyticsAgent.put failed', e);
      }
    }
  ]
});
