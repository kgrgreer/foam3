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
  package: 'net.nanopay.flinks.model',
  name: 'HolderModel',

  documentation: 'model for Flinks account holder',

  properties: [
    {
      class: 'String',
      name: 'Name'
    },
    {
      // type: 'net.nanopay.flinks.model.AddressModel',
      // javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      // javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.AddressModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.AddressModel',
      name: 'Address'
    },
    {
      class: 'String',
      name: 'Email',
      validateObj: function(Email) {
        var emailRegex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

        if ( ! emailRegex.test(Email) ) {
          return this.EmailError;
        }
      }
    },
    {
      class: 'String',
      name: 'PhoneNumber',
      validateObj: function(PhoneNumber) {
        var hasOkLength = PhoneNumber.length >= 10 && PhoneNumber.length <= 30;

        if ( ! PhoneNumber || ! hasOkLength ) {
          return this.PhoneError;
        }
      }
    }
  ],

  messages: [
    { name: 'EMAIL_ERROR', message: 'Invalid email address' },
    { name: 'PHONE_ERROR', message: 'Invalid phone number' }
  ]
});
