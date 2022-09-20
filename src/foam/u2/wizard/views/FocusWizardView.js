/**
 * @license
 * Copyright 2022 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'foam.u2.wizard.views',
  name: 'FocusWizardView',
  extends: 'foam.u2.View',

  imports: [ 'popup?', 'controlBorder?' ],

  exports: [ 'showTitle' ],

  css: `
    ^ {
      display: flex;
      flex-direction: column;
      width: 65vw;
      padding: 3.2rem 0;
      flex-grow: 1;
      /**
       * Make this work with conditional titles
       * gap: 1.6rem;
      */
    }

    ^:not(^isFullscreen) {
      margin: 0 40pt;
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
      flex: 1;
      min-height: 0;
    }
    ^wizardletTitle {
      text-align: center;
      margin-bottom: 2.4rem;
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
        class: 'foam.u2.wizard.views.ProgressBarWizardView'
      }
    },
    {
      class: 'foam.u2.ViewSpec',
      name: 'contentsView',
      value: {
        class: 'foam.u2.wizard.views.FlexibleWizardContentsView'
      }
    },
    {
      class: 'Boolean',
      name: 'showTitle'
    },
    {
      class: 'String',
      name: 'viewTitle',
      expression: function (data$currentWizardlet) {
        return data$currentWizardlet.title;
      }
    }
  ],

  methods: [
    function render() {
      const self = this;
      // Pass off the progress indication to controlBorder
      if ( this.controlBorder )
        this.controlBorder.progressView$ = this.slot(function(data) { return { ...self.progressWizardView, data$: self.data$ } });
      this.addClass()
        .enableClass(this.myClass('isFullscreen'), this.popup?.fullscreen$)
        .callIf(! this.controlBorder, function(){
          this.tag(this.progressWizardView, { data: this.data });
        })
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
        .start(this.contentsView, { data: this.data })
          .addClass(this.myClass('contents'))
        .end()
        ;
    }
  ]
});
