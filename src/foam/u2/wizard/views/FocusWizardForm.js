/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'FocusWizardForm',
  extends: 'foam.u2.wizard.controllers.IncrementalWizardController',

  exports: [
    'showTitle'
  ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      margin: 40pt;
      width: 45vw;
      min-height: 65vh;
    }
    ^contents {
      flex-grow: 1;
    }
    ^wizardletTitle {
      text-align: center;
    }
  `,

  properties: [
    {
      class: 'foam.u2.ViewSpec',
      name: 'progressWizardView',
      value: {
        // class: 'foam.u2.borders.NullBorder'
        class: 'foam.u2.wizard.views.ProgressBarWizardView',
      }
    },
    {
      class: 'Boolean',
      name: 'showTitle'
    }
  ],

  methods: [
    function render() {
      const self = this;
      this.addClass()
        .start(this.progressWizardView, { data: this })
          .addClass(this.myClass('progress'))
        .end()
        .add(this.slot(function (showTitle, data$currentWizardlet) {
          return showTitle ?
            this.E().start('h1')
              .addClass(self.myClass('wizardletTitle'))
              .add(data$currentWizardlet.title)
            .end('h2') : this.E()
        }))
        .start(this.view, { data: this })
          .addClass(this.myClass('contents'))
        .end()
        ;
    }
  ]
});
