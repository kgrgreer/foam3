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
  package: 'net.nanopay.interac.ui.shared.topNavigation',
  name: 'IndiaLogoView',
  extends: 'foam.u2.View',

  documentation: 'View to display business logo and name.',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          width: 25%;
          display: inline-block;
          padding-top: 3px;
          text-align: left;
        }
        ^ img {
          border-radius: 50%;
          width: 40px;
          height: 40px;
          margin-top: 5px;
          margin-right: 5px;
          margin-bottom: 5px;
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
          top: -16;
          height: 20px;
          display: inline-block;
          margin-left: 10px;
        }
      */}
    })
  ],

  methods: [
    function initE() {
      this
        .addClass(this.myClass())
        .start('div').addClass('alignLeft')
          .tag({class: 'foam.u2.tag.Image', data: 'images/inr.svg'})
          .start('div').addClass(this.myClass('business-name'))
            .add('India Bank')
          .end()
        .end();
    }
  ]
});