foam.CLASS({
  package: 'net.nanopay.b2b.ui.shared.topNavigation',
  name: 'BusinessLogoView',
  extends: 'foam.u2.View',

  documentation: 'View to display business logo and name.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 15%;
          text-align: center;
          display: inline-block;
          padding-top: 3px;
          padding-left: 50px;
        }
        ^ img {
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin: 5px;
        }
        ^ span{
          position: relative;
          font-weight: 300;
          font-size: 16px;
          margin-left: 10px;
        }
        ^business-name{
          width: 70%;
          text-align: left;
          overflow: hidden;
          text-overflow: ellipsis;
          position: relative;
          white-space: nowrap;
          top: -35;
          height: 20px;
          display: inline-block;
        }
        ^placeholder-business{
          width: 40px;
          height: 40px;
          margin: 5px;
          border-radius: 50%;
          background: white;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      var self = this;

      this
        .addClass(this.myClass())
        .start('div')
          .add(this.data.profileImageURL$.map(function(profileImg){
            return profileImg ? 
              self.E()
                .start({ class: 'foam.u2.tag.Image', data: self.data.profileImageURL$ }).end() :
              self.E()
                .start().addClass(self.myClass('placeholder-business')).end()
          }))
          .start('div').addClass(self.myClass('business-name')).add(self.data.name$).end()
        .end();
    }
  ]
});