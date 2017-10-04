foam.CLASS({
  package: 'net.nanopay.retail.ui.settings.business',
  name: 'EditBusinessView',
  extends: 'foam.u2.View',

  documentation: 'Edit business view.',

  requires:[
    'foam.nanos.auth.Address',
    'net.nanopay.retail.model.Business'
  ],

  imports: [
    'userDAO',
    'addressDAO',
    'user',
    'stack',
    'countryDAO',
    'regionDAO'
  ],

  exports: [
    'as data'
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 100%;
          margin: auto;
          background-color: #edf0f5;
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
        ^ .editBusinessContainer {
          width: 490px;
          margin: auto;
        }
        ^ h2{
          opacity: 0.6;
          font-family: Roboto;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          margin-bottom: 50px;
        }
        ^registration-container{
          background: white;
          padding: 4px 25px;
          margin-bottom: 20px;
        }
        ^ h3{
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.2px;
        } 
        ^ img{
          display: inline-block;
        }
        ^upload-button{
          display: inline-block;
          width: 135px;
          height: 40px;
          border-radius: 2px;
          background: white;
          border: solid 1px #59a5d5;
          color: #59a5d5;
          position: relative;
          top: -35;
          right: -40;
          font-size: 14px;
          cursor: pointer;
          outline: 0;
        }
        ^ p{
          font-size: 10px;
          color: #093649;
          font-weight: 300;
          display: inline-block;
          position: relative;
          right: 100;
        }
        ^ input{
          width: 100%;
          height: 40px;
          margin-top: 7px;
        }
        ^ label{
          font-weight: 300;
          font-size: 14px;
          color: #093649;
        }
        .input-container{
          width: 46%;
          display: inline-block;
          margin-bottom: 20px;
          margin-right: 15px;
        }
        .dropdown{
          width: 200px;
          height: 200px;
          background: black;
        }
        ^ .foam-u2-tag-Select{
          height: 40px;
          width: 200px;
          background: white;
          border: 1px solid lightgrey;
          margin-top: 5px;
        }
        ^ .foam-u2-ActionView-saveBusiness{
          width: 100%;
          height: 40px;
          background: #59aadd;
          margin-bottom: 15px;
          outline: 0;
          border: 0;
          font-size: 14px;
          color: white;
          cursor: pointer;
          opacity: 1;
        }
        ^ .foam-u2-ActionView-saveBusiness:hover {
          background-color: #59aadd;
        }
      */}
    })
  ],

  properties:[
    'businessName',
    'businessNumber',
    'website',
    'address',
    'city',
    'postalCode',
    {
      name: 'regionList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.regionDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      }
    },
    {
      name: 'countryList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.countryDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      }
    },
    {
      name: 'businessTypeList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      }
    },
    {
      name: 'sectorList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      }
    }
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('div').addClass('editBusinessContainer')
            .start('h2').add('Edit Business profile').end()
            .start().addClass(this.myClass('registration-container'))
              .start('h3').add('Business information').end()
              .start().addClass(this.myClass('business-image-container'))
                .tag({class:'foam.u2.tag.Image', data: 'ui/images/business-placeholder.png'})
                .start('button').add('Upload Image').addClass(this.myClass('upload-button')).end()
                .start('p').add('JPG, GIF, JPEG, BMP or PNG').end()
              .end()
              .start().addClass(this.myClass('business-registration-input'))
                .start().addClass('input-container')
                  .start('label').add('Company Name').end()
                  .start(this.BUSINESS_NAME).end()
                .end()
                .start().addClass('input-container')
                  .start('label').add('Company Type').end()
                  .start(this.BUSINESS_TYPE_LIST).end()
                .end()
                .start().addClass('input-container')
                  .start('label').add('Business Sector').end()
                  .add(this.SECTOR_LIST)
                .end()
                .start().addClass('input-container')
                  .start('label').add('Business Number').end()
                  .start(this.BUSINESS_NUMBER).end()
                .end()
                .start().addClass('input-container')
                  .start('label').add('Website').end()
                  .start(this.WEBSITE).end()
                .end()
              .end()
              .start('h3').add('Business Address').end()
              .start().addClass(this.myClass('business-registration-input'))
                .start().addClass('input-container')
                  .start('label').add('Country').end()
                  .add(this.COUNTRY_LIST)
                .end()
                .start().addClass('input-container')
                  .start('label').add('Address').end()
                  .start(this.ADDRESS).end()
                .end()
                .start().addClass('input-container')
                  .start('label').add('City').end()
                  .start(this.CITY).end()
                .end()
                .start().addClass('input-container')
                  .start('label').add('Province').end()
                  .add(this.REGION_LIST)
                .end()
                .start().addClass('input-container')
                  .start('label').add('Postal Code').end()
                  .start(this.POSTAL_CODE).end()
                .end()
              .end()
              .add(this.SAVE_BUSINESS)
            .end()
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'saveBusiness',
      label: 'Save',
      code: function() {
        var self = this;

        this.userDAO.put(
          {
            name: self.businessName,
            businessTypeId: self.businessTypeList,
            sectorId: self.sectorList,
            businessNumber: self.businessNumber,
            website: self.website
          }
        ).then(function(a) {

          return self.addressDAO.put(
            {
              countryId: self.countryList,
              regionId: self.regionList,
              address: self.address,
              city: self.city,
              postalCode: self.postalCode,
              businessId: self.business.id
            }
          )
        }).then(function(a) {
          self.stack.push({ class:'net.nanopay.retail.ui.settings.business.BusinessSettingsView' })
        })
      }
    }
  ]
});
