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
  name: 'TxnDetail',
  extends: 'net.nanopay.sps.RequestPacket',

  properties: [
    {
      class: 'String',
      name: 'name',
    },
    {
      class: 'String',
      name: 'acct',
      value: 'C',
      documentation: 'C - Checking, S - Saving'
    },
    {
      class: 'String',
      name: 'other'
    },
    {
      class: 'String',
      name: 'location',
      value: 'NANOPAY'
    },
    {
      class: 'String',
      name: 'type'
    },
    {
      class: 'String',
      name: 'secc',
      value: 'CCD'
    },
    {
      class: 'String',
      name: 'ptc',
      value: 'S'
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.sps.PayerInfo',
      name: 'payer',
      documentation: 'optional'
    },
    {
      class: 'String',
      name: 'codd',
      documentation: 'optional'
    },
    {
      class: 'String',
      name: 'trnm',
      documentation: 'optional'
    },
    {
      class: 'String',
      name: 'description',
      documentation: 'optional'
    },
    {
      class: 'String',
      name: 'last4',
      documentation: 'optional'
    },
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
    list.add(TxnDetail.NAME);
    list.add(TxnDetail.ACCT);
    list.add(TxnDetail.OTHER);
    list.add(TxnDetail.LOCATION);
    list.add(TxnDetail.TYPE);
    list.add(TxnDetail.SECC);
    list.add(TxnDetail.PTC);
    list.add(TxnDetail.PAYER);
  }
  
  public String toSPSString() {
    StringBuilder sb = new StringBuilder();   

    for (PropertyInfo propertyInfo : list) {
      if (propertyInfo.isSet(this) && propertyInfo.get(this) != null) {
        if (propertyInfo instanceof AbstractFObjectPropertyInfo) {
          // append payerInfo
          sb.append("[").append(propertyInfo.getName().toUpperCase()).append("]")
            .append(((RequestPacket) propertyInfo.get(this)).toSPSString())
            .append("[/").append(propertyInfo.getName().toUpperCase()).append("]");
        } else {
          sb.append("[").append(propertyInfo.getName().toUpperCase()).append("]")
            .append(propertyInfo.get(this))
            .append("[/").append(propertyInfo.getName().toUpperCase()).append("]");
        }
      }
    }
              
    return sb.toString();
  }
        `);
      }
    }
  ]

});
