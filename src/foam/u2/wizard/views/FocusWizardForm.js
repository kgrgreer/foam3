/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'FocusWizardForm',
  extends: 'foam.u2.wizard.controllers.IncrementalWizardController',

  imports: [ 'popup?' ],

  exports: [ 'showTitle' ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      width: 65vw;
      min-height: 65vh;
      height: 100%;
      margin: 3.2rem auto;
      /**
       * Make this work with conditional titles 
       * gap: 1.6rem; 
      */
    }

    ^:not(^isFullscreen) {
      margin: 40pt;
      margin-top: 0;
    }

    @media only screen and (min-width: /*%DISPLAYWIDTH.MD%*/ 768px) {
      ^:not(^isFullscreen) {
        width: 45vw;
      }
    }
    @media only screen and (min-width: /*%DISPLAYWIDTH.LG%*/ 960px) {
      ^:not(^isFullscreen) {
        width: 25vw;
      }
    }
    ^contents {
      flex-grow: 1;
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
        .enableClass(this.myClass('isFullscreen'), this.popup?.fullscreen$)
        .start(this.progressWizardView, { data: this })
          .addClass(this.myClass('progress'))
        .end()
        .add(this.slot(function (showTitle, data$currentWizardlet) {
          return showTitle && data$currentWizardlet.showTitle ?
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
