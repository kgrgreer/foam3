foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'BusinessSettingsCard',
  extends: 'foam.u2.View',

  documentation: 'view which contain business information & edit link.',

  imports: [
    'user'
  ],

  properties: [
    'data'
  ],

  css: `
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
      margin-right: 50px;
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
      height: 15px;
      word-wrap: break-word;
      width: 125px;
      min-height: 15px;
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
    ^ .profileImg {
      width: 80px;
      height: 80px;
    }
    ^ .profileImgDiv {
      padding-left: 10px;
      margin-bottom: 20px;
      line-height: 80px;
      position: relative;
    }
    ^ .active-status{
      color: #2cab70;
    }
    ^ .user-status{
      margin: 15px;
    }
    ^ 
  `,

  methods: [
    function initE(){
      var self = this;

      this
        .addClass(this.myClass())
        .start().addClass('user-status').enableClass('active-status', this.data.status$ == 'Active')
          .add('Status: ', this.data.status)
        .end()
        .start().addClass('profileImgDiv')
          .start({ class: 'foam.u2.tag.Image', data: 'images/business-placeholder.png'}).addClass('profileImg').end()
          .start().add(this.data.organization).addClass('companyName').end()
        .end()
        .start()
          .start().addClass('inlineDiv')
            .start().addClass('labelDiv')
              .start().add('Country Code').addClass('labelTitle').end()
              .start().add(this.data.countryId).addClass('labelContent').end()
            .end()
            .start().addClass('labelDiv')
              .start().add('Clearing Code').addClass('labelTitle').end()
              .start().add(this.data.clearingId).addClass('labelContent').end()
            .end()
          .end()
          .start().addClass('inlineDiv')
            .start().addClass('labelDiv')
              .start().add('Bank Identification No.').addClass('labelTitle').end()
              .start().add(this.data.businessIdentificationNumber).addClass('labelContent').end()
            .end()
            .start().addClass('labelDiv')
              .start().add('Clearing ID').addClass('labelTitle').end()
              .start().add(this.data.clearingId).addClass('labelContent').end()
            .end()
          .end()
          .start().addClass('topInlineDiv')
            .start().addClass('labelDiv')
              .start().add('Branch ID').addClass('labelTitle').end()
              .start().add(this.data.branchId).addClass('labelContent').end()
            .end()
          .end()
          .start().addClass('topInlineDiv')
            .start().addClass('labelDiv')
              .start().add('Address').addClass('labelTitle').end()
              .startContext()
                .start().hide(this.data.address.structured$)
                  .start().add(this.data.address.address1).addClass('labelContent').end()
                  .start().add(this.data.address.address2).addClass('labelContent').end()
                .end()
                .start().show(this.data.address.structured$)
                  .start().add(this.data.address.streetNumber +" "+this.user.address.streetName).addClass('labelContent').end()
                  .start().add(this.data.address.suite).addClass('labelContent').end()
                .end()
              .endContext()
              .start().add(this.data.address.city + ", "+this.user.address.regionId).addClass('labelContent').end()
              .start().add(this.data.address.countryId).addClass('labelContent').end()
              .start().add(this.data.address.postalCode).addClass('labelContent').end()
            .end()
          .end()
        .end();
    }
  ]
});