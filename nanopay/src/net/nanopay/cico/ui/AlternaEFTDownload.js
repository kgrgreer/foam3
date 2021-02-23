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
  package: 'net.nanopay.cico.ui',
  name: 'AlternaEFTDownload',
  extends: 'foam.u2.View',

  documentation: 'View for downloading Alterna CSV',

  imports:[
    'window'
  ],
  
  exports:[],

  css: `
  ^ {
    width: 992px;
    margin: 0 auto;
  }
  ^ .foam-u2-ActionView-downloadCsv {
    width: 135px;
    height: 50px;
    border-radius: 2px;
    background: /*%PRIMARY3%*/ #406dea;
    color: white;
    margin: 0;
    padding: 0;
    border: 0;
    outline: none;
    cursor: pointer;
    line-height: 50px;
    font-size: 14px;
    font-weight: normal;
    box-shadow: none;
  }
  ^ .foam-u2-ActionView-downloadCsv:hover {
    opacity: 0.9;
  }
  `,

  properties:[],

  methods:[
    function initE(){
      this.SUPER();

      this.addClass(this.myClass())
        .start()
        .start().addClass('light-roboto-h2').add('Alterna-EFT CSV Download').end()
          .start().add(this.DOWNLOAD_CSV).end()
        .end();
    }
  ],

  actions: [
    {
      name: 'downloadCsv',
      label: 'Download CSV',
      code: function(X) {
        var self = this;
        var alternaUrl = self.window.location.origin + "/service/alterna";
        self.window.location.assign(alternaUrl);
      }
    }
  ]

});