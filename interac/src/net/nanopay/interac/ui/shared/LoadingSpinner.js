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
  package: 'net.nanopay.interac.ui.shared',
  name: 'LoadingSpinner',
  extends: 'foam.u2.View',

  documentation: 'Small view that just shows a loading spinner',

  axioms: [
    foam.u2.CSS.create({
      code: function CSS() {/*
        ^{
          display: inline-block;
          width: 20px;
          height: 20px;
        }

        ^ .hidden {
          display: none;
        }
      */}
    })
  ],

  properties: [
    {
      class: 'Boolean',
      name: 'isHidden',
      value: false
    }
  ],

  methods: [
    function initE(){
      this.SUPER();

      this
        .addClass(this.myClass()).enableClass('hidden', this.isHidden$)
        .start({class: 'foam.u2.tag.Image', data: 'images/ic-loading.svg'}).end();
    },

    function show() {
      this.isHidden = false;
    },

    function hide() {
      this.isHidden = true;
    }
  ]
});
