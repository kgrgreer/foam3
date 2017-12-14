foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'BusinessProfileView',
  extends: 'foam.u2.View',

  imports: [ 'stack', 'user' ],

  documentation: 'View displaying business information',

  css: `
    ^{
      width: 100%;
      background-color: #edf0f5;
      margin: auto;
    }
    ^ .businessSettingsContainer {
      width: 992px;
      margin: auto;
    }
    ^ .Container {
      width: 992px;
      min-height: 80px;
      margin-top: 50px;
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 2px;
      background-color: white;
      box-sizing: border-box;
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
    }
    ^ .profileImg {
      width: 80px;
      height: 80px;
    }
    ^ .profileImgDiv {
      margin-bottom: 20px;
      margin-top: 20px;
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
      margin-right: 100px;
    }
    ^ .topInlineDiv {
      display: inline-block;
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
      display: flex;
      word-wrap: break-word;
      width: 125px;
    }
    ^ .addBankButtonDiv {
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
      float: right;
    }
    ^ .expand-Container{
      width: 952px;
      height: auto;
      overflow: hidden;
      transition: max-height 1.2s ease;
      max-height: 600px;
    }
    ^ .expandTrue{
      max-height: 0;
    }
    ^ .net-nanopay-ui-ActionView-editProfile {
      color: #59a5d5;
      width: 62px;
      height: 0px;
      text-decoration: underline;
      margin-left: 42px;
    }
    ^ .net-nanopay-ui-ActionView-editProfile:hover {
      cursor: pointer;
    }
    ^ .net-nanopay-ui-ActionView-editProfile:active {
      color: #2974a3;
    }
  `,

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
    {
      name: "expandBox4",
      value: false
    },
    'businessSectorName',
    'businessTypeName'
  ],

  methods: [
    function initE() {
      this.SUPER();
      var self = this;

      this.user.businessSectorId$find.then(function(sector) {
        self.businessSectorName = sector.name;
      });
      this.user.businessTypeId$find.then(function(type) {
        self.businessTypeName = type.name;
      });


      this
        .addClass(this.myClass())

        .start().addClass('businessSettingsContainer')
          .start().addClass('Container')
            .start().add('Business Profile').addClass('boxTitle').end()
            .add(this.EDIT_PROFILE)
            .start().addClass('profileImgDiv')
              .start({ class: 'foam.u2.tag.Image', data: 'images/business-placeholder.png'}).addClass('profileImg').end()
              .start().add(this.user.businessName).addClass('companyName').end()
            .end()
            .start()
              .start().addClass('inlineDiv')
                .start().addClass('labelDiv')
                  .start().add('Company Type').addClass('labelTitle').end()
                  .start().add(this.businessTypeName$).addClass('labelContent').end()
                .end()
                .start().addClass('labelDiv')
                  .start().add('Business Sector').addClass('labelTitle').end()
                  .start().add(this.businessSectorName$).addClass('labelContent').end()
                .end()
              .end()
              .start().addClass('inlineDiv')
                .start().addClass('labelDiv')
                  .start().add('Business Identification No.').addClass('labelTitle').end()
                  .start().add(this.user.businessIdentificationNumber).addClass('labelContent').end()
                .end()
                .start().addClass('labelDiv')
                  .start().add('Issuing Authority').addClass('labelTitle').end()
                  .start().add(this.user.issuingAuthority).addClass('labelContent').end()
                .end()
              .end()
              .start().addClass('topInlineDiv')
                .start().addClass('labelDiv')
                  .start().add('Website').addClass('labelTitle').end()
                  .start().add(this.user.website).addClass('labelContent').end()
                .end()
              .end()
              .start().addClass('topInlineDiv')
                .start().addClass('labelDiv')
                  .start().add('Address').addClass('labelTitle').end()
                  .startContext()
                    .start().hide(this.user.address.structured$)
                      .start().add(this.user.address.address1).addClass('labelContent').end()
                      .start().add(this.user.address.address2).addClass('labelContent').end()
                    .end()
                    .start().show(this.user.address.structured$)
                      .start().add(this.user.address.streetNumber +" "+this.user.address.streetName).addClass('labelContent').end()
                      .start().add(this.user.address.suite).addClass('labelContent').end()
                    .end()
                  .endContext()
                  .start().add(this.user.address.city + ", "+this.user.address.regionId).addClass('labelContent').end()
                  .start().add(this.user.address.countryId).addClass('labelContent').end()
                  .start().add(this.user.address.postalCode).addClass('labelContent').end()
                .end()
              .end()
            .end()
          .end()
        .end()
      .end()
    .end()
    }
  ],

  actions: [
    {
      name: 'editProfile',
      label: 'Edit Profile',
      code: function (X) {
        X.stack.push({ class: 'net.nanopay.settings.business.EditBusinessView', showCancel: true });
      }
    }
  ]
});
