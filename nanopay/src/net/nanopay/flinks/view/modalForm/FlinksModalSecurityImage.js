/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.flinks.view.modalForm',
  name: 'FlinksModalSecurityImage',
  extends: 'net.nanopay.ui.wizardModal.WizardModalSubView',

  documentation: 'Security authentication for Laurentienne bank. May be used by other banks',

  requires: [
    'foam.log.LogLevel',
    'foam.u2.LoadingSpinner',
    'foam.u2.tag.Image'
  ],

  exports: [
    'as securityImage'
  ],

  imports: [
    'connectingMessage',
    'isConnecting',
    'notify',
    'institution',
    'flinksAuth',
    'user'
  ],

  css: `
    ^ {
      width: 504px;
      max-height: 80vh;
      overflow-y: auto;
    }
    ^content {
      position: relative;
      padding: 24px;
      padding-top: 0;
    }
    ^image-container {
      display: flex;
      flex-direction: row;
      justify-content: center;
      flex-wrap: wrap;
    }
    ^image-card {
      box-sizing: border-box;
      text-align: center;
      width: 211px;
      height: 133px;
      padding: 0 40px;
      background-color: white;
      cursor: pointer;

      box-shadow: 0 1px 1px 0 #dae1e9;

      -webkit-transition: box-shadow .15s ease-in-out;
      -moz-transition: box-shadow .15s ease-in-out;
      -ms-transition: box-shadow .15s ease-in-out;
      -o-transition: box-shadow .15s ease-in-out;
      transition: box-shadow .15s ease-in-out;
    }
    ^image-card.selected,
    ^image-card:hover {
      box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.16);
    }
    ^image-card.selected {
      border: 1px solid /*%PRIMARY3%*/ #406dea;
    }
    ^card-spacer {
      margin: auto;
      margin-bottom: 16px;
    }
    ^image-vertical-helper {
      display: inline-block;
      vertical-align: middle;
      height: 100%;
    }
    ^image {
      display: inline-block;
      vertical-align: middle;
      width: auto;
      max-height: 80%;
    }
    ^shrink {
      /*max height - titlebar - navigationbar - content padding*/
      max-height: calc(80vh - 77px - 88px - 24px);
      overflow: hidden;
    }
    ^instructions {
      font-size: 16px;
      line-height: 1.5;
      color: #8e9090;

      margin: 0;
      margin-bottom: 24px;
    }
  `,

  properties: [
    {
      name: 'loadingSpinner',
      factory: function() {
        var spinner = this.LoadingSpinner.create();
        return spinner;
      }
    },
    {
      class: 'Array',
      name: 'imageSelection'
    },
    {
      class: 'Int',
      name: 'tick',
      value: -10000000
    },
    {
      class: 'Int',
      name: 'selectedIndex',
      value: -1
    }
  ],

  messages: [
    { name: 'INSTRUCTIONS', message: 'Please select your personal image below: ' },
    { name: 'INVALID_FORM', message: 'Please select your personal image to proceed'}
  ],

  methods: [
    function init() {
      this.SUPER();
      this.viewData.questions = new Array(1);
      this.viewData.questions[0] =
        this.viewData.securityChallenges[0].Prompt;
      this.imageSelection =
        new Array(this.viewData.securityChallenges[0].Iterables.length)
          .fill(false);
    },

    function initE() {
      var self = this;
      this.addClass(this.myClass())
        .start({ class: 'net.nanopay.flinks.view.element.FlinksModalHeader', institution: this.institution }).end()
        .start().addClass(this.myClass('content'))
          .start().addClass('spinner-container').show(this.isConnecting$)
            .start().addClass('spinner-container-center')
              .add(this.loadingSpinner)
              .start('p').add(this.connectingMessage$.map((m) => { return m; })).addClass('spinner-text').end()
            .end()
          .end()
          .start().enableClass(this.myClass('shrink'), this.isConnecting$)
            .start('p').addClass(this.myClass('instructions')).add(this.INSTRUCTIONS).end()
            .start().addClass(this.myClass('image-container'))
              .forEach(this.viewData.securityChallenges[0].Iterables,
                function(item, index) {
                  var src = 'data:image/png;base64,' + item; // item should be a base64 image string.
                  this.start().addClass(self.myClass('image-card')).addClass(self.myClass('card-spacer'))
                    .enableClass('selected', self.tick$.map(function() {
                      return self.imageSelection[index];
                    }))
                    .start().addClass(self.myClass('image-vertical-helper')).end()
                    .start({ class: 'foam.u2.tag.Image', data: src })
                      .addClass(self.myClass('image'))
                    .end()
                    .on('click', function() {
                      // clear old selection
                      if ( self.selectedIndex >= 0) {
                        self.imageSelection[self.selectedIndex] = false;
                      }
                      self.selectedIndex = index;
                      self.imageSelection[self.selectedIndex] = true;
                      self.tick ++;
                    })
                  .end();
              })
            .end()
          .end()
        .end()
        .start({class: 'net.nanopay.sme.ui.wizardModal.WizardModalNavigationBar', back: this.BACK, next: this.NEXT}).end();
    }
  ],

  actions: [
    {
      name: 'back',
      label: 'Cancel',
      code: function(X) {
        X.closeDialog();
      }
    },
    {
      name: 'next',
      label: 'Connect',
      code: function(X) {
        var self = this;
        var model = X.securityImage;
        if ( model.isConnecting ) return;
        if ( model.selectedIndex < 0 ) {
          X.notify(model.INVALID_FORM, '', self.LogLevel.ERROR, true);
          return;
        }

        X.viewData.answers = new Array(1);
        X.viewData.answers[0] = [];
        for ( var i = 0; i < model.imageSelection.length; i ++ ) {
          if ( model.imageSelection[i] === true ) {
            X.viewData.answers[0]
              .push(X.viewData.securityChallenges[0].Iterables[i]);
          }
        }

        X.viewData.submitChallenge();
      }
    }
  ]
});
