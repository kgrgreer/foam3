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
  name: 'FlinksThreeOptionForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  requires: [
    'foam.u2.view.ChoiceView',
    'foam.u2.view.StringArrayView',
    'foam.u2.tag.Input'
  ],
  imports: [
    'isConnecting'
  ],

  css: `
    ^ {
      width: 492px;
    }
    ^ .subContent {
      height: 405px;
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
    ^ .foam-u2-view-StringArrayView {
      width: 450px;
      height: 30px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
      outline: none;
      padding: 5px;
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
    ^ .foam-u2-ActionView-closeButton {
      float: right;
      margin: 0;
      box-sizing: border-box;
      background-color: #A93226;
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

    ^ .foam-u2-ActionView-nextButton {
      float: right;
      margin: 0;
      outline: none;
      border:none;
      min-width: 136px;
      height: 40px;
      border-radius: 2px;
      background-color: #148F77;
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      color: #FFFFFF;
      margin-right: 40px;
    }

    ^ .foam-u2-ActionView-nextButton:disabled {
      background-color: #7F8C8D;
    }

    ^ .foam-u2-ActionView-nextButton:hover:enabled {
      cursor: pointer;
    }

    ^ .foam-u2-tag-Select {
      width: 450px;
      background-color: #ffffff;
      border: solid 1px rgba(164, 179, 184, 0.5);
    }
  `,

  properties: [
    {
      Class: 'Array',
      name: 'answerCheck',
    },
    {
      Class: 'Array',
      name: 'questionCheck',
    },
    {
      Class: 'Int',
      name: 'tick',
      value: -10000000
    }
  ],

  messages: [
    { name: 'Step', message: 'Step3: Please response below security challenges' },
    { name: 'header1', message: 'Please reset the security questions: '},
    { name: 'answerError', message: 'Invalid answer'}
  ],

  methods: [
    function init() {
      var self = this;
      this.SUPER();
      //this.form.isEnabledButtons(true);
      this.viewData.questions = [
        'What is your mother maiden name','What is your age','cccc'
      ];
      this.iters = [
        ['aaaaa',
        'bbbbb',
        'ccccc'],
        ['aaaaa1',
        'bbbbb1',
        'ccccc1'],
        ['aaaaa2',
        'bbbbb2',
        'ccccc2'],
      ];
      this.questionCheck = new Array(this.iters.length).fill(false);
      this.answerCheck = new Array(this.iters.length).fill(false);
      // for ( var i = 0 ; i < this.viewData.securityChallenges.length ; i++ ){
      //   this.viewData.questions[i] = this.viewData.securityChallenges[i].Prompt;
      // }
      this.nextLabel = 'next';
    },
    function initE() {
      this.SUPER();
      var self = this;
      this
        .addClass(this.myClass())
        .start('div').addClass('subTitle')
          .add(this.Step)
        .end()
        .start('div').addClass('subContent')
          .tag({class: 'net.nanopay.flinks.view.form.FlinksSubHeader'})
          .start('p').add(this.header1).addClass('header1').style({'margin-left':'20px'}).end()
          .forEach(this.iters, function(data, index){

            var view = self.ChoiceView.create({choices : data, placeholder: 'Please select a question'});
            var input = self.StringArrayView.create({onKey: true, data:[]});
            //var input = self.Input.create({onKey: true});
            view.data$.sub(function(){
              console.log(view.choices);
              if ( ! view.data ) {
                self.questionCheck[index] = false;
              } else {
                self.questionCheck[index] = true;
              }
              self.tick++;
            });
            input.data$.sub(function(){
              console.log(input.data);
              if ( input.data.length == 0 ) {
                self.answerCheck[index] = false;
              } else {
                self.answerCheck[index]  = true
              }
              self.tick++;
              // for ( var o in input.data ) {
              //   if ( o.trim().length == 0 ) return self.answerCheck[index] = false;
              // }

            });
            this.start(view).style({ 'margin-left':'20px', 'margin-top':'20px'}).end()
            this.start(input).style({ 'margin-left':'20px', 'margin-top':'10px'}).end()
          })
        .end()
        .start('div').style({'margin-top' : '15px', 'height' : '40px'})
          .tag(this.CLOSE_BUTTON)
          .tag(this.NEXT_BUTTON)
        .end()
        .start('div').style({'clear' : 'both'}).end()
    }
  ],
  actions: [
    {
      name: 'nextButton',
      label: 'next',
      isEnabled: function(isConnecting, tick, answerCheck, questionCheck) {
        if ( isConnecting == true ) return false;
        for ( var i = 0 ; i < questionCheck.length ; i++ ) {
          if ( questionCheck[i] == false || answerCheck[i] == false ) {
            return false;
          }
        }
        return true;
      },
      code: function(X) {
        console.log('nextButton');
        this.isConnecting = true;
        //X.form.goNext();
      }
    },
    {
      name: 'closeButton',
      label: 'close',
      code: function(X) {
        console.log('close the form');
        X.form.goBack();
      }
    }
  ]
})
