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

/**
 * @license
 * Copyright 2019 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */

foam.CLASS({
  package: 'net.nanopay.tx',
  name: 'ReferenceLineItemCitationView',
  extends: 'foam.u2.CitationView',

  requires: [
    'foam.u2.detail.SectionedDetailPropertyView'
  ],

  methods: [
   function initE() {
      this.addClass(this.myClass());

      this.tag(this.SectionedDetailPropertyView, { 
        data$: this.data$,
        prop: this.of.REFERENCE_ID 
      })
    }
  ]
});
