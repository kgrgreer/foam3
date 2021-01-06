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
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksImageForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'form',
    'isConnecting',
    'loadingSpinner',
    'rollBackView',
    'viewData'
  ],

  requires: [
    'foam.u2.tag.Image'
  ],

  css: `
    ^ {
      width: 492px;
    }
    ^ .subContent {
      width: 490px;
      height: 400px;
    }
    ^ .sub-header {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .header1 {
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
    }
    ^ .image {
      float: left;
      margin-top: 15px;
      margin-left: 15px;
      width: 78px;
      height: 78px;
      background-color: #d8d8d8;
      border: solid 1px #23c2b7;
      cursor: pointer;
    }
    ^ .image-select {
      border: solid 1px red;
    }
    ^ .image-unselect {
      border: 1px solid #23c2b7;
    }
    ^ .image:nth-child(-n+4) {
      margin-top: 0px;
    }
    ^ .image:nth-child(4n+1) {
      margin-left: 0px;
    }
    ^ .qa-block {
      margin-top: 20px;
      margin-left: 20px;
      width: 440px;
      height: 270px;
      overflow: auto;
    }
    ^ .foam-u2-ActionView-nextButton {
      float: right;
      margin: 0;
      box-sizing: border-box;
      background-color: #59a5d5;
      outline: none;
      border:none;
      width: 136px;
      height: 40px;
      border-radius: 2px;
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      color: #FFFFFF;
    }

    ^ .foam-u2-ActionView-closeButton:hover:enabled {
      cursor: pointer;
    }

    ^ .foam-u2-ActionView-closeButton {
      float: left;
      margin: 0;
      outline: none;
      min-width: 136px;
      height: 40px;
      border-radius: 2px;
      // background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      margin-right: 40px;
      margin-left: 1px;
    }

    ^ .foam-u2-ActionView-nextButton:disabled {
      background-color: #7F8C8D;
    }

    ^ .foam-u2-ActionView-nextButton:hover:enabled {
      cursor: pointer;
    }
  `,

  properties: [
    {
      class: 'Array',
      name: 'imageSelection'
    },
    {
      Class: 'Int',
      name: 'tick',
      value: - 10000000
    }
  ],

  messages: [
    { name: 'Step', message: 'Step3: Please response below security challenges' },
    { name: 'header1', message: 'Please select below images: ' }
  ],

  methods: [
    function init() {
      this.SUPER();
      this.viewData.questions = new Array(1);
      this.viewData.questions[0] =
        this.viewData.SecurityChallenges[0].Prompt;
      this.imageSelection =
        new Array(this.viewData.SecurityChallenges[0].Iterables.length)
          .fill(false);
    },

    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())
        .start('div').addClass('subTitleFlinks')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .tag({
            class: 'net.nanopay.flinks.view.form.FlinksSubHeader',
            secondImg: this.viewData.selectedInstitution.image
          })
          .start('p').add(this.header1).addClass('header1').style({ 'margin-left': '20px' }).end()
          .start('div').addClass('qa-block')
            .forEach(this.viewData.SecurityChallenges[0].Iterables,
              function(item, index) {
                var image = self.Image.create({ data: item });
                this.start(image).addClass('image').addClass(self.tick$.map(function() {
                  if ( self.imageSelection[index] ) {
                    return 'image-select';
                  } else {
                    return 'image-unselect';
                  }
                }))
                .on('click', function() {
                  self.imageSelection[index] = ! self.imageSelection[index];
                  self.tick ++;
                }).end();
            })
            .start('div').style({ 'clear': 'both' }).end()
          .end()
          .start()
            .start(this.loadingSpinner).addClass('loadingSpinner')
              .start('h6').add('Connecting, please wait...').addClass('spinnerText').end()
            .end()
          .end()
        .end()
        .start('div').style({ 'margin-top': '15px', 'height': '40px' })
          .tag(this.NEXT_BUTTON)
          .tag(this.CLOSE_BUTTON)
        .end()
        .start('div').style({ 'clear': 'both' }).end();
    }
  ],
  actions: [
    {
      name: 'nextButton',
      label: 'Continue',
      isEnabled: function(isConnecting) {
        return ! isConnecting;
      },
      code: function(X) {
        this.viewData.answers = new Array(1);
        this.viewData.answers[0] = [];
        for ( var i = 0; i < this.imageSelection.length; i ++ ) {
          if ( this.imageSelection[i] === true ) {
            this.viewData.answers[0]
              .push(this.viewData.SecurityChallenges[0].Iterables[i]);
          }
        }
        this.isConnecting = true;
        this.viewData.submitChallenge();
      }
    },
    {
      name: 'closeButton',
      label: 'Cancel',
      code: function(X) {
        this.rollBackView();
      }
    }
  ]
});
