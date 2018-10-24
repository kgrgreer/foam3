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
