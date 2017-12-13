foam.CLASS({
  package: 'net.nanopay.settings.business',
  name: 'BusinessSettingsCard',
  documentation: 'view which contain business information & edit link.',

  properties: [

  ],

  css: `
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
  `,

  methods: [
    function initE(){
      var self = this;

      this
        addClass(this.myClass())
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
    }
  ]
});