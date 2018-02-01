foam.CLASS({
  package: 'net.nanopay.flinks.view.form',
  name: 'FlinksImageForm',
  extends: 'net.nanopay.ui.wizard.WizardSubView',

  imports: [
    'bankImgs',
    'form',
    'isConnecting',
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
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;
    }
    ^ .header1 {
      font-family: Roboto;
      font-size: 14px;
      font-weight: 300;
      font-style: normal;
      font-stretch: normal;
      line-height: normal;
      letter-spacing: 0.2px;
      text-align: left;
      color: #093649;    
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
    ^ .net-nanopay-ui-ActionView-nextButton {
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

    ^ .net-nanopay-ui-ActionView-closeButton:hover:enabled {
      cursor: pointer;
    }

    ^ .net-nanopay-ui-ActionView-closeButton {
      float: right;
      margin: 0;
      outline: none;
      min-width: 136px;
      height: 40px;
      border-radius: 2px;
      background-color: rgba(164, 179, 184, 0.1);
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-size: 12px;
      font-weight: lighter;
      letter-spacing: 0.2px;
      margin-right: 40px;
    }

    ^ .net-nanopay-ui-ActionView-nextButton:disabled {
      background-color: #7F8C8D;
    }

    ^ .net-nanopay-ui-ActionView-nextButton:hover:enabled {
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
      value: -10000000
    }
  ],

  messages: [
    { name: 'Step', message: 'Step3: Please response below security challenges' },
    { name: 'header1', message: 'Please select below images: '}
  ],

  methods: [
    function init() {
      this.SUPER();
      this.viewData.questions = new Array(1);
      this.viewData.questions[0] = this.viewData.SecurityChallenges[0].Prompt;
      this.imageSelection = new Array(this.viewData.SecurityChallenges[0].Iterables.length).fill(false);
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
          .tag({class: 'net.nanopay.flinks.view.form.FlinksSubHeader', secondImg: this.bankImgs[this.viewData.selectedOption].image})
          .start('p').add(this.header1).addClass('header1').style({'margin-left':'20px'}).end()
          .start('div').addClass('qa-block')
            .forEach(this.viewData.SecurityChallenges[0].Iterables, function(item, index){
              var image = self.Image.create({data: item});
              this.start(image).addClass('image').addClass(self.tick$.map(function(){
                if ( self.imageSelection[index] ) {
                  return 'image-select';
                } else {
                  return 'image-unselect';
                }
              }))
              .on('click', function() {
                self.imageSelection[index] = ! self.imageSelection[index];
                self.tick++;
              }).end()
            })
            .start('div').style({'clear' : 'both'}).end()
          .end()
        .end()
        .start('div').style({'margin-top' : '15px', 'height' : '40px'})
          .tag(this.NEXT_BUTTON)
          .tag(this.CLOSE_BUTTON)
        .end()
        .start('div').style({'clear' : 'both'}).end()
    }
  ],
  actions: [
    {
      name: 'nextButton',
      label: 'next',
      isEnabled: function(isConnecting) {
        if ( isConnecting === true ) return false;
        return true;
      },
      code: function(X) {
        this.viewData.answers = new Array(1);
        this.viewData.answers[0] = [];
        for ( var i = 0 ; i < this.imageSelection.length ; i++ ) {
          if ( this.imageSelection[i] === true ) {
            this.viewData.answers[0].push(this.viewData.SecurityChallenges[0].Iterables[i]);
          }
        }
        console.log(this.viewData.answers);
        console.log(this.viewData.questions);
        this.isConnecting = true;
        X.form.goNext();
      }
    },
    {
      name: 'closeButton',
      label: 'close',
      code: function(X) {
        X.form.goBack();
      }
    }
  ]
})