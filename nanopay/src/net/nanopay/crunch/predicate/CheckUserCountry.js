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
  package: 'net.nanopay.crunch.predicate',
  name: 'CheckUserCountry',

  extends: 'foam.mlang.predicate.AbstractPredicate',
  implements: ['foam.core.Serializable'],

  documentation: `Returns true if the business is from canada.`,

  javaImports: [
    'foam.core.X',
    'foam.dao.ArraySink',
    'foam.dao.DAO',
    'foam.nanos.auth.Subject',
    'foam.nanos.auth.User',
    'foam.nanos.auth.Address',
    'static foam.mlang.MLang.*'
  ],

  properties: [
    {
      class: 'String',
      name: 'country',
      documentation: 'Compare passed in string to businesses country'
    },
    {
      class: 'FObjectProperty',
      of: 'foam.mlang.ContextObject',
      name: 'user',
      documentation: 'Optional argument for user when not checking context user'
    }
  ],

  methods: [
    {
      name: 'f',
      javaCode: `
        if ( ! ( obj instanceof X ) ) return false;
        X x = (X) obj;
        User user = null;
        if ( getUser() != null ) { 
          try { 
            user = (User) getUser().f(x);
          } catch (Exception e) { 
            return false;
          }
        } else {
          user = ((Subject) x.get("subject")).getUser();
        }
        Address address = (Address) user.getAddress();
        if ( getCountry() == null && getCountry().equals("") ) {
          return address == null || address.getCountryId() == null || address.getCountryId().equals(getCountry());
        }
        if ( address != null ) {
          return address.getCountryId().equals(getCountry());
        }
        return false;
      `
    }
  ]
});
