foam.CLASS({
  package: 'net.nanopay.auth.ui',
  name: 'TwoAuthView',
  extends: 'foam.u2.View',

  documentation: '2 Auth View',

  axioms: [
    foam.u2.CSS.create({
      code: `
        ^{
          width: 990px;
          margin: auto;
          text-align: center;
          color: /*%BLACK%*/ #1e1f21;
          font-weight: 400;
        }
        ^ h2{
          font-weight: 400;
          font-size: 14px;
          line-height: 1;
          letter-spacing: 0.4px;
          color: /*%BLACK%*/ #1e1f21;
          font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
          margin: 50px 0;
        }
        ^2-auth-container{
          width: 650px;
          margin: auto;
          background: white;
          padding: 20px;
          font-weight: 400;
        }
        ^ h1{
          margin-top: 0;
          font-size: 30px;
          font-weight: 300;
          line-height: 1;
          letter-spacing: 0.5px;
          text-align: left;
          font-weight: 300;
        }
        ^ h3{
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          text-align: left;
          font-weight: 400;
        }
        ^left-div{
          display: inline-block;
          width: 324px;
        }

        ^left-div h3{
          width: 230px;
        }
        ^right-div{
          display: inline-block;
          width: 220px;
          padding-left: 75px;
          vertical-align: top;
        }
        ^right-div h3{
          margin-top: 35px;
        }
        ^left-div img{
          width: 150px;
          height: 150px;
          margin-top: 20px;
          margin-right: 100px;
        }
        ^ h4{
          font-size: 12px;
          line-height: 1.33;
          letter-spacing: 0.2px;
          margin-top: 50px;
          font-weight: 400;
          display: inline-block;
        }
        ^ input{
          width: 100%;
          height: 40px;
        }
        ^ label{
          float: left;
          margin: 50px 0 10px;
          font-weight: 300;
        }
        ^ button{
          width: 100%;
          height: 40px;
          font-size: 14px;
          background: #59aadd;
          margin-top: 25px;
          position: relative;
          right: 4;
        }
        ^line{
          width: 1px;
          background: #e7e7e7;
          height: 215px;
          display: inline-block;
          position: relative;
          top: -25;
          left: -20;
        }
        ^ p{
          display: inline-block;
          margin-right: 3px;
          font-size: 12px;
        }
      `
    })
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass())
        .start()
          .start('h2').add('Add an extra layer of security to your account by enabling Two-Factor Authentication.').end()
          .start().addClass(this.myClass('2-auth-container'))
            .start().addClass(this.myClass('left-div'))
              .start('h1').add('1').end()
              .start('h3').add('Open the authentication app on your mobile device to retrieve your validation code.').end()
              .tag({class:'foam.u2.tag.Image', data: 'images/2-auth.png'})
            .end()
            .start().addClass(this.myClass('line')).end()
            .start().addClass(this.myClass('right-div'))
              .start('h1').add('2').end()
              .start('h3').add('Enter the validation code to continue.').end()
              .start('label').add('Validation Code').end()
              .start('input').end()
              .start('button').add('Validate').end()
            .end()
          .end()
          .start('h4').add('Download the authenticator for').end()
          .start('p').add('iOS').style({color: '#59a5d5', 'cursor': 'pointer', 'margin-left':'2px'}).end()
          .start('p').add('or').style({'margin-right':'0'}).end()
          .start('p').add('Android').style({color: '#59a5d5', 'cursor': 'pointer', 'margin-left':'2px'}).end()
          .start('p').add('or').style({'margin-right':'0'}).end()
          .start('p').add('Windows').style({color: '#59a5d5', 'cursor': 'pointer', 'margin-left':'2px'}).end()
          .start('p').add('mobile devices.').end()
        .end()
    }
  ]
})