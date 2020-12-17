/**
 * NANOPAY CONFIDENTIAL
 *
 * [2020] nanopay Corporation
 * All Rights Reserved.
 *
 * NOTICE:  All information contained herein is, and remains
 * the property of nanopay Corporation.
 * The intellectual and technical concepts contained
 * herein are proprietary to nanopay Corporation
 * and may be covered by Canadian and Foreign Patents, patents
 * in process, and are protected by trade secret or copyright law.
 * Dissemination of this information or reproduction of this material
 * is strictly forbidden unless prior written permission is obtained
 * from nanopay Corporation.
 */

foam.CLASS({
  package: 'net.nanopay.ui',
  name: 'ExpandContainer',
  extends: 'foam.u2.Element',
  documentation: 'Provide an expandable div' +
      ' which take content to display inside.',

  imports: [
    'stack'
  ],

  properties: [
    {
      name: 'expandBox',
      value: false
    },
    'title',
    'link',
    'linkView'
  ],

  css: `
    ^ {
      width: 962px;
      min-height: 80px;
      margin-bottom: 20px;
      padding: 20px;
      border-radius: 2px;
      background-color: white;
      box-sizing: border-box;
      margin: auto;
    }
    ^ .boxTitle {
      opacity: 0.6;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 20px;
      font-weight: 300;
      line-height: 20px;
      letter-spacing: 0.3px;
      text-align: left;
      color: /*%BLACK%*/ #1e1f21;
      display: inline-block;
      position: relative;
      top: 10px;
    }
    ^ .expand-BTN{
      width: 135px;
      height: 40px;
      border-radous: 2px;
      background-color: /*%PRIMARY3%*/ #406dea;
      border-radius: 2px;
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #ffffff;
      cursor: pointer;
      display: inline-block;
      float: right;
      position: relative;
    }
    ^ .close-BTN{
      width: 135px;
      height: 40px;
      border-radius: 2px;
      box-shadow: 0 0 1px 0 rgba(9, 54, 73, 0.8);
      font-family: /*%FONT1%*/ Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif;
      font-size: 14px;
      line-height: 2.86;
      letter-spacing: 0.2px;
      text-align: center;
      color: #fff;
      cursor: pointer;
      display: inline-block;
      float: right;
    }
    ^ .expand-Container{
      width: 952px;
      height: auto;
      overflow: hidden;
      transition: max-height 1.6s ease-out;
      max-height: 1725px;
      margin: 0 auto;
      margin-right: 0;
      -webkit-transition: -webkit-transform 1.6s ease-out;
      -moz-transition: -moz-transform 1.6s ease-out;
      -ms-transition: -ms-transform 1.6s ease-out;
    }
    ^ .expandTrue{
      max-height: 0px;
    }
    ^ .link-tag{
      display: inline-block;
      border-bottom: 1px solid #59a5d5;
      color: #59a5d5;
      margin-left: 50px;
      position: relative;
      top: 10px;
      cursor: pointer;
    }
  `,

  methods: [
    function init() {
      var self = this;
      this
      .addClass(this.myClass())
      .start()
        .start().addClass('boxTitle')
          .add(this.title)
        .end()
        .callIf(this.link, function() {
          this.start().addClass('link-tag')
            .add(self.link).on('click', function() {
              self.stack.push({ class: self.linkView });
            })
          .end();
        })
        .start()
          .addClass('expand-BTN')
          .enableClass('close-BTN', this.expandBox$, true)
          .add(this.expandBox$.map(function(e) {
            return e ? 'Expand' : 'Collapse';
          }))
          .enableClass('', self.expandBox = (self.expandBox ? false : true))
          .on('click', function() {
            self.expandBox = ( self.expandBox ? false : true );
          })
        .end()
        .start()
          .addClass('expand-Container')
          .enableClass('expandTrue', self.expandBox$)
          .start('div', null, this.content$).end()
        .end()
      .end();
    }
  ]
});
