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
  package: 'net.nanopay.country.br',
  name: 'NatureCode',
  extends: 'foam.nanos.crunch.Capability',

  messages: [
    { name: 'ENTER_NATURE_CODE', message: 'Please enter a Nature Code.' } 
  ],

  properties: [
    {
      class: 'Reference',
      of: 'net.nanopay.country.br.NatureCode',
      name: 'group'
    },
    {
      class: 'Reference',
      of: 'foam.nanos.auth.Country',
      name: 'country'
    },
    { 
      class: 'String', 
      name: 'code', 
      validateObj: function(code) { 
        var regex = /^[0-9]{5}$/;
        if ( ! regex.test(code) && group != null) { 
          return this.ENTER_NATURE_CODE; 
        } 
      } 
    }
  ]
});
