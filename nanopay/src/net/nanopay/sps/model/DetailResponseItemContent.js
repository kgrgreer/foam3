foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'DetailResponseItemContent',
  extends: 'net.nanopay.sps.utils.ResponsePacket',

  properties: [
    {
      class: 'String',
      name: 'itemID',
    },
    {
      class: 'String',
      name: 'originalRequestStatus'
    },
    {
      class: 'String',
      name: 'manualEntryIndicator'
    },
    {
      class: 'String',
      name: 'localTransactionTime'
    },
    {
      class: 'String',
      name: 'field5NotUsed'
    },
    {
      class: 'String',
      name: 'amount'
    },
    {
      class: 'String',
      name: 'invoice'
    },
    {
      class: 'String',
      name: 'clerkID'
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
list.add(ITEM_ID);
list.add(ORIGINAL_REQUEST_STATUS);
list.add(MANUAL_ENTRY_INDICATOR);
list.add(LOCAL_TRANSACTION_TIME);
list.add(FIELD5NOT_USED);
list.add(AMOUNT);
list.add(INVOICE);
list.add(CLERK_ID);
}

public String toSPSString() {
  StringBuilder sb = new StringBuilder();
  
  for (PropertyInfo propertyInfo : list) {
    sb.append("[").append(propertyInfo.getName().toUpperCase()).append("]").append(propertyInfo.get(this))
      .append("[/").append(propertyInfo.getName().toUpperCase()).append("]");
  }

  return sb.toString();
}
        `);
      }
    }
  ]

});
