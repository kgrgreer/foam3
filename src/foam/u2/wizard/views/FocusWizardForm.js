/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'FocusWizardForm',
  extends: 'foam.u2.wizard.controllers.IncrementalWizardController',

  imports: [
    'controlBorder?',
    'popup?'
  ],

  exports: [ 'showTitle' ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      flex-grow: 1;
      height: 100%;
      /**
       * Make this work with conditional titles
       * gap: 1.6rem;
      */
    }

    ^:not(^isFullscreen) {
      margin: 0 40pt;
    }

    ^contents {
      flex: 1;
      min-height: 0;
    }
    ^wizardletTitle {
      text-align: center;
      margin-bottom: 1.6rem;
    }
    ^wizardletSub {
      font-size: 1.6rem;
    }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'progressWizardView',
      value: {
        class: 'foam.u2.borders.NullBorder'
        // class: 'foam.u2.wizard.views.ProgressBarWizardView',
      }
    },
    {
      class: 'Boolean',
      name: 'showTitle'
    },
    {
      class: 'String',
      name: 'viewTitle',
      expression: function (showTitle, data$currentWizardlet) {
        return showTitle && data$currentWizardlet.showTitle ? data$currentWizardlet.title : '';
      }
    }
  ],

  methods: [
    function render() {
      const self = this;
      this.addClass()
        .enableClass(this.myClass('isFullscreen'), this.popup?.fullscreen$)
        .start(this.progressWizardView, { data: this })
          .addClass(this.myClass('progress'))
        .end()
        .add(this.slot(function (controlBorder, showTitle, data$currentWizardlet) {
          return showTitle && data$currentWizardlet.showTitle && ! controlBorder ?
            this.E().start()
              .addClasses(['h300', self.myClass('wizardletTitle')])
              .add(data$currentWizardlet.title)
            .end() : null
        }))
        .add(this.slot(function (data$currentWizardlet) {
          return data$currentWizardlet.subTitle ?
            this.E().start()
              .addClasses([self.myClass('wizardletTitle'), 'p', self.myClass('wizardletSub')])
              .add(data$currentWizardlet.subTitle)
            .end() : null
        }))
        .start(this.view, { data: this })
          .addClass(this.myClass('contents'))
        .end()
        ;
    }
  ]
});
