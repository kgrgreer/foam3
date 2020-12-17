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
  package: 'net.nanopay.sps',
  name: 'PayerInfo',
  extends: 'net.nanopay.sps.RequestPacket',

  properties: [
    {
      class: 'String',
      name: 'firstName',
    },
    {
      class: 'String',
      name: 'lastName'
    },
    {
      class: 'String',
      name: 'middleInitial'
    },
    {
      class: 'String',
      name: 'primaryAddress'
    },
    {
      class: 'String',
      name: 'secondaryAddress'
    },
    {
      class: 'String',
      name: 'city'
    },
    {
      class: 'String',
      name: 'stateAbbreviation'
    },
    {
      class: 'String',
      name: 'zipCode'
    },
    {
      class: 'String',
      name: 'cellPhone'
    },
    {
      class: 'String',
      name: 'emailAddress'
    }
  ],

  javaImports: [
    'java.util.*',
    'foam.core.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
  {
    list = new ArrayList<>();
    list.add(PayerInfo.FIRST_NAME);
    list.add(PayerInfo.LAST_NAME);
    list.add(PayerInfo.MIDDLE_INITIAL);
    list.add(PayerInfo.PRIMARY_ADDRESS);
    list.add(PayerInfo.SECONDARY_ADDRESS);
    list.add(PayerInfo.CITY);
    list.add(PayerInfo.STATE_ABBREVIATION);
    list.add(PayerInfo.ZIP_CODE);
    list.add(PayerInfo.CELL_PHONE);
    list.add(PayerInfo.EMAIL_ADDRESS);
  }
  
  public String toSPSString() {
    StringBuilder sb = new StringBuilder();   
    
    for ( int i = 0; i < list.size(); i++) {
      PropertyInfo propertyInfo = list.get(i);
      sb.append(propertyInfo.get(this));
      
      if ( i < list.size() - 1) {
        sb.append("|");
      }
    }
    
    return sb.toString();
  }
        `);
      }
    }
  ]

});
