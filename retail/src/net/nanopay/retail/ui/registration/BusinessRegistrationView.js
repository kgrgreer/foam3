foam.CLASS({
  package: 'net.nanopay.retail.ui.registration',
  name: 'BusinessRegistrationView',
  extends: 'foam.u2.View',

  documentation: 'Business registration view.',

  requires:[
    'net.nanopay.common.model.Address',
    'net.nanopay.retail.model.Business',
    'net.nanopay.retail.model.BusinessInformation'
  ],

  imports: [
    'businessDAO',
    'addressDAO',
    'business',
    'stack',
    'countryDAO',
    'regionDAO',
    'businessSectorDAO',
    'businessTypeDAO',
    'userDAO'
  ],

  exports: [
    'businessInformation as data'
  ],

  properties:[
    'user',
    { name: 'businessInformation', expression: function(user) { return user.businessInformation; }},
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
          dao: X.businessTypeDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      }
    },
    {
      name: 'businessSectorList',
      view: function(_, X) {
        return foam.u2.view.ChoiceView.create({
          dao: X.businessSectorDAO,
          objToChoice: function(a){
            return [a.id, a.name];
          }
        })
      }
    }
  ],

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 490px;
          margin: auto;
        }
        ^ h2{
          opacity: 0.6;
          font-size: 20px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.3px;
          text-align: left;
          color: #093649;
          margin-bottom: 25px;
          margin-top: 25px;
        }
        ^registration-container{
          background: white;
          padding: 25px 25px; 25px;
          margin-bottom: 25px;
        }
        ^ h3{
          font-size: 14px;
          font-weight: bold;
          letter-spacing: 0.2px;
          margin: 0;
          margin-bottom: 10px;
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
          outline: none;
          cursor: pointer;
        }
        ^upload-button:hover {
          background: #59a5d5;
          color: white;
        }
        ^ p{
          font-size: 10px;
          color: #093649;
          font-weight: 300;
          display: inline-block;
          position: relative;
          right: 100;
          margin-left: 5px;
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
        }
        ^ .input-container-right {
          width: 46%;
          display: inline-block;
          margin-bottom: 20px;
          float: right;
        }
        .dropdown{
          width: 200px;
          height: 200px;
          background: black;
        }
        ^ .foam-u2-tag-Select{
          height: 40px;
          width: 100%;
          background: white;
          border: 1px solid lightgrey;
          margin-top: 7px;
          outline: none;
          display: inline-block;
        }
        ^ .foam-u2-ActionView-saveBusiness{
          width: 100%;
          height: 40px;
          border-radius: 2px;
          border: solid 1px #59a5d5;
          margin-right: 20px;
          background-color: #59aadd;
          text-align: center;
          cursor: pointer;
          color: #ffffff;
          font-size: 14px;
          outline: none;
        }
        ^ .foam-u2-ActionView-saveBusiness:hover {
          background: none;
          background-color: #3783b3;
          border-color: #3783b3;
        }
      */}
    })
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('h2').add('Create Business Profile').end()
          .start().addClass(this.myClass('registration-container'))
            .start('h3').add('Business Information').end()
            .start().addClass(this.myClass('business-image-container'))
              .tag({class:'foam.u2.tag.Image', data: 'ui/images/business-placeholder.png'})
              .start('button').add('Upload Image').addClass(this.myClass('upload-button')).end()
              .start('p').add('JPG, GIF, JPEG, BMP or PNG').end()
            .end()
            .start().addClass(this.myClass('business-registration-input'))
              .start().addClass('input-container')
                .start('label').add('Company Name').end()
                .start(this.BusinessInformation.BUSINESS_NAME).end()
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Company Type').end()
                .start(this.BUSINESS_TYPE_LIST).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('Business Sector').end()
                .add(this.BUSINESS_SECTOR_LIST)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Business Number').end()
                .start(this.BusinessInformation.BUSINESS_NUMBER).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('Website').end()
                .start(this.BusinessInformation.WEBSITE).end()
              .end()
            .end()
            .start('h3').add('Business Address').end()
            .start().addClass(this.myClass('business-registration-input'))
              .start().addClass('input-container')
                .start('label').add('Country').end()
                .add(this.COUNTRY_LIST)
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Address').end()
                .start(this.BusinessInformation.ADDRESS).end()
              .end()
              .start().addClass('input-container')
                .start('label').add('City').end()
                .start(this.BusinessInformation.CITY).end()
              .end()
              .start().addClass('input-container-right')
                .start('label').add('Province').end()
                .add(this.REGION_LIST)
              .end()
              .start().addClass('input-container')
                .start('label').add('Postal Code').end()
                .start(this.BusinessInformation.POSTAL_CODE).end()
              .end()
            .end()
            .add(this.SAVE_BUSINESS)
          .end()
        .end()
    }
  ],

  actions: [
    {
      name: 'saveBusiness',
      label: 'Save',
      code: function(){
        var self = this;

        console.log(this.user);

        this.userDAO.put(this.user).then(function(a){
          self.stack.push({ class:'net.nanopay.retail.ui.dashboard.DashboardView' })
        })
      }
    }
  ]
})
