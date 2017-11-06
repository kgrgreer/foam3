foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'BusinessSettingsView',
  extends: 'foam.u2.View',

  imports: [ 'stack' ],

  documentation: 'View displaying business information',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 100%;
          background-color: #edf0f5;
          margin: auto;
        }
        ^ .businessSettingsContainer {
          width: 992px;
          margin: auto;
        }
        ^ .row {
          display: inline-block;
          margin-top: 16px;
          width: 100%;
        }
        ^ .settingsBar {
          width: 100%;
          height: 40px;
          line-height: 40px;
          background-color: #FFFFFF;
          margin-bottom: 20px;
        }
        ^ .settingsBarContainer {
          width: 992px;
          margin: auto;
        }
        ^ .spacer {
          display: inline-block;
          margin-left: 8px;
        }
        ^ .spacer:first-child {
          margin-left: 0;
        }
        ^ .foam-u2-ActionView {
          opacity: 0.6;
          font-family: Roboto;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.3px;
          color: #093649;
          padding: 0;
          padding-left: 30px;
          display: inline-block;
          cursor: pointer;
          margin: 0;
          border: none;
          background: transparent;
          outline: none;
          line-height: 40px;
        }
        ^ .foam-u2-ActionView-personalProfile {
          padding-left: 0;
        }
        ^ .foam-u2-ActionView:hover {
          background: white;
          opacity: 1;
        }
        ^ .Container {
          width: 992px;
          height: 80px;
          border-radius: 2px;
          background-color: white;
        }
        ^ .boxTitle {
          opacity: 0.6;
          font-family: 'Roboto';
          font-size: 20px;
          font-weight: 300;
          line-height: 20px;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          display: inline-block;
          margin-left: 20px;
          margin-top: 20px;
        }
        ^ .profileImg {
          width: 80px;
          height: 80px;
        }
        ^ .profileImgDiv {
          margin-bottom: 20px;
          margin-left: 20px;
          line-height: 80px;
          position: relative;
        }
        ^ .companyName {
          font-family: 'Roboto';
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #093649;
          margin-left: 40px;
          display: inline-block;
          line-height: 16px;
          position: absolute;
          top: 40%;
        }
        ^ .labelDiv {
          margin-bottom: 30px;
        }
        ^ .inlineDiv {
          display: inline-block;
          margin-left: 20px;
          margin-right: 100px;
        }
        ^ .topInlineDiv {
          display: inline-block;
          margin-left: 20px;
          margin-right: 100px;
          vertical-align: top;
        }
        ^ .labelTitle {
          font-family: Roboto;
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.2px;
          text-align: left;
          color: #093649;
          margin-bottom: 15px;
        }
        ^ .labelContent {
          font-family: Roboto;
          font-size: 14px;
          font-weight: 300;
          letter-spacing: 0.2px;
          color: #093649;
        }
        ^ .addBankButtonDiv {
          width: 100%;
          text-align: center;
          margin-top: 40px;
        }
        ^ .foam-u2-ActionView-addBank {
          font-family: Roboto;
          height: 40px;
          border-radius: 2px;
          background-color: white;
          border: solid 1px #59a5d5;
          display: inline-block;
          color: #59a5d5;
          text-align: center;
          cursor: pointer;
          font-size: 14px;
          margin: 0;
          outline: none;
          opacity: 1;
          padding: 0;
          padding-left: 10px;
          padding-right: 10px;
        }
        ^ .foam-u2-ActionView-addBank:hover {
          background: white;
        }
        ^ .foam-u2-ActionView-editProfile {
          text-decoration: underline;
          font-size: 12px;          
          line-height: 16px;
          letter-spacing: 0.2px;
          color: #59a5d5;
          display: inline-block;
          margin-left: 40px;
          cursor: pointer;
          opacity: 1;
        }
        ^ .expand-BTN{
          width: 135px;
          height: 40px;
          border-radous: 2px;
          background-color: #59a5d5;
          border-radius: 2px;
          font-family: Roboto;
          font-size: 14px;
          line-height: 2.86;
          letter-spacing: 0.2px;
          text-align: center;
          color: #ffffff;
          cursor: pointer;
          display: inline-block;
          margin-right: 20px;
          margin-top: 20px;
          float: right;
        }
        ^ .close-BTN{
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background-color: rgba(164, 179, 184, 0.1);
          box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
          font-family: 2px;
          font-size: 14px;
          line-height: 2.86;
          letter-spacing: 0.2px;
          text-align: center;
          color: #093649;
          cursor: pointer;
          display: inline-block;
          margin-right: 20px;
          margin-top: 20px;
          float: right;
        }
        ^ .expandFirstFalse-Container{
          width: 992px;
          height: 272px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-bottom: 20px;
          overflow: hidden;
          transition: height 1s;
        }
        ^ .expandSecondFalse-Container{
          width: 992px;
          height: 120px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-bottom: 20px;
          overflow: hidden;
          transition: height 1s;
        }
        ^ .expandThirdFalse-Container{
          width: 992px;
          height: 120px;
          border-radius: 2px;
          background-color: #ffffff;
          margin-bottom: 20px;
          overflow: hidden;
          transition: height 1s;
        }
        ^ .expandTrue{
          visibility: hidden;
          height: 0px;
          transition: background .1s linear;

        @media only screen and (max-width: 992px) {
        ^ .spacer {
          margin-left: 0px;
        }
        ^ .spacer:last-child {
          float: middle;
        }
      */}
    })
  ],

  properties: [
    {
      name: "expandBox1",
      value: false
    },
    {
      name: "expandBox2",
      value: false
    },
    {
      name: "expandBox3",
      value: false
    },
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this
        .addClass(this.myClass())

        .start().addClass('businessSettingsContainer')
          .start('div').addClass('Container')
            .start().add('Business Profile').addClass('boxTitle').end()
            .start()
              .addClass('expand-BTN').enableClass('close-BTN', this.expandBox1$.map(function(e) { return e ? false : true; }))
              .add(this.expandBox1$.map(function(e) { return e ? "Expand" : "Close"; }))
              .enableClass('', self.expandBox1 = (self.expandBox1 ? false : true))
              .on('click', function(){ self.expandBox1 = ( self.expandBox1 ? false : true ) })
            .end()
          .end()

          .start().addClass('expandFirstFalse-Container').enableClass("expandTrue", self.expandBox1$)
            .add(this.EDIT_PROFILE)
            .br()
            .start('div').addClass('profileImgDiv')
              .start({ class: 'foam.u2.tag.Image', data: 'images/business-placeholder.png'}).addClass('profileImg').end()
              .start().add('Company Name').addClass('companyName').end()
            .end()
            .start('div')
              .start('div').addClass('inlineDiv')
                .start('div').addClass('labelDiv')
                  .start().add('Company Type').addClass('labelTitle').end()
                  .start().add('Limited Company').addClass('labelContent').end()
                .end()
                .start('div').addClass('labelDiv')
                  .start().add('Business Sector').addClass('labelTitle').end()
                  .start().add('Tobacco & Alcohol').addClass('labelContent').end()
                .end()
              .end()
              .start('div').addClass('inlineDiv')
                .start('div').addClass('labelDiv')
                  .start().add('Business Identification No.').addClass('labelTitle').end()
                  .start().add('0000000001').addClass('labelContent').end()
                .end()
                .start('div').addClass('labelDiv')
                  .start().add('Issuing Authority').addClass('labelTitle').end()
                  .start().add('Placeholder Text').addClass('labelContent').end()
                .end()
              .end()
              .start('div').addClass('topInlineDiv')
                .start('div').addClass('labelDiv')
                  .start().add('Website').addClass('labelTitle').end()
                  .start().add('www.nanopay.net').addClass('labelContent').end()
                .end()
              .end()
              .start('div').addClass('topInlineDiv')
                .start('div').addClass('labelDiv')
                  .start().add('Address').addClass('labelTitle').end()
                  .start().add('123 Avenue').addClass('labelContent').end()
                  .start().add('Toronto, Ontario').addClass('labelContent').end()
                  .start().add('Canada').addClass('labelContent').end()
                  .start().add('M2G 1K9').addClass('labelContent').end()
                .end()
              .end()
            .end()
          .end()
        
          .start('div').addClass('Container')
            .start().add('Bank Account').addClass('boxTitle').end()
            .start()
              .addClass('expand-BTN').enableClass('close-BTN', this.expandBox2$.map(function(e) { return e ? false : true; }))
              .add(this.expandBox2$.map(function(e) { return e ? 'Expand' : "Close"; }))
              .enableClass('', self.expandBox2 = (self.expandBox2 ? false : true))
              .on('click', function(){ self.expandBox2 = ( self.expandBox2 ? false : true )})
            .end()
          .end()
          .start().addClass('expandSecondFalse-Container').enableClass("expandTrue", self.expandBox2$)
            .start('div').addClass('addBankButtonDiv')
              .add(this.ADD_BANK)
            .end()
          .end()
         
          .start('div').addClass('Container')
            .start().add('Multi-user Management').addClass('boxTitle').end()
            .start()
              .addClass('expand-BTN').enableClass('close-BTN', this.expandBox3$.map(function(e) { return e ? false : true; }))
              .add(this.expandBox3$.map(function(e) { return e ? 'Expand' : "Close"; }))
              .enableClass('', self.expandBox3 = (self.expandBox3 ? false : true))
              .on('click', function(){ self.expandBox3 = ( self.expandBox3 ? false : true )})
            .end()
          .end()
          .start().addClass('expandthirdFalse-Container').enableClass("expandTrue", self.expandBox3$)
          .start().addClass()
            .add()
          .end()
        .end()

        .tag({ class: "net.nanopay.settings.business.IntegrationView"})
      .end()
											
        
    }
  ]
});
