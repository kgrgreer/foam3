foam.CLASS({
    package: 'net.nanopay.settings.business',
    name: 'experiment',
    extends: 'foam.u2.View',
  
    imports: [ 'stack' ],
  
    documentation: 'just an experiment',
  
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
          ^ .Container {
            width: 992px;
            min-height: 80px;
            border-radius: 2px;
            background-color: white;
            padding: 20px;
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
          ^ .paragraphy{
            font-family: Roboto;
            font-size: 14px;
            font-weight: 300;
            letter-spacing: 0.2px;
            text-align: left;
            color: #093649;
            width: 100%;
          } 
          ^ .expand-Container{
            width: 952px;
            height: auto;
            overflow: hidden;
            transition: max-height 1.5s ease-out;
            max-height: 1000px;
          }
          ^ .expandTrue{
            visibility: hidden;
            max-height: 0;
            transition: height .1s ease-out;
          }
          ^ .integrationImgDiv{
					width: 223px;
					height: 120px;
					border: solid 1px #dce0e7;  
					display: inline-block;
					margin: 25px 20px 0px 0px;
					position: relative;
					box-sizing: border-box;
				}
				^ .integrationImg{
					display: block;
					position: absolute;  
					top: 0;  
					bottom: 0;  
					left: 0;  
					right: 0;  
					margin: auto;
				}
				^ .last-integrationImgDiv{
					margin-right: 0px;
				}
          
        */}
      })
    ],
  
    properties: [
      {
        name: "expandBox1",
        value: false
      }
    ],
  
    methods: [
      function initE() {
        this.SUPER();
        var self = this;
  
        this
          .addClass(this.myClass())
  
          .start().addClass('businessSettingsContainer')
            .start().addClass('Container')
              
                .start().add('Integration Management').addClass('boxTitle').end()
                .start()
                  .addClass('expand-BTN').enableClass('close-BTN', this.expandBox1$.map(function(e) { return e ? false : true; }))
                  .add(this.expandBox1$.map(function(e) { return e ? "Expand" : "Close"; }))
                  .enableClass('', self.expandBox1 = (self.expandBox1 ? false : true))
                  .on('click', function(){ self.expandBox1 = ( self.expandBox1 ? false : true ) })
                .end()
              

                .start().addClass('expand-Container').enableClass("expandTrue", self.expandBox1$) 
                  .start().addClass('paragraphy').add('This is the placeholder text for paragraphy').end() 
                  .start().addClass('integrationImgDiv')
                  .start({class:'foam.u2.tag.Image', data:'images/setting/integration/xero.png'}).addClass('integrationImg')
                  .attrs({
                      srcset: 'images/setting/integration/xero@2x.png 2x, images/setting/integration/xero@3x.png 3x'
                      })
                  .end()
                .end()
                .start().addClass('integrationImgDiv')
                  .start({class:'foam.u2.tag.Image', data:'images/setting/integration/qb.png'}).addClass('integrationImg')
                  .attrs({
                      srcset: 'images/setting/integration/qb@2x.png 2x, images/setting/integration/qb@3x.png 3x'
                      })
                  .end()
                .end()
                .start().addClass('integrationImgDiv')
                  .start({class:'foam.u2.tag.Image', data:'images/setting/integration/fresh.png'}).addClass('integrationImg')
                  .attrs({
                      srcset: 'images/setting/integration/fresh@2x.png 2x, images/setting/integration/fresh@3x.png 3x'
                      })
                  .end()
                .end()
                .start().addClass('integrationImgDiv last-integrationImgDiv')
                .start({class:'foam.u2.tag.Image', data:'images/setting/integration/intacct.png'}).addClass('integrationImg')
                  .attrs({
                      srcset: 'images/setting/integration/intacct@2x.png 2x, images/setting/integration/intacct@3x.png 3x'
                      })
                  .end()      
                .end()
            .end()
  
            
        .end()   
      }
    ]
  });
  