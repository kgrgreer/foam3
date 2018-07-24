foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'DetailResponseItemContent',
  extends: 'net.nanopay.sps.model.ResponsePacket',

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
    'foam.core.*',
    'foam.lib.parse.*',
    'foam.util.SafetyUtil'
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
  
  @Override
  public ResponsePacket parseSPSResponse(String response) {
    if ( response == null || response.length() == 0 ) {
      return null;
    }
    
    char unitSeparator = (char) 31;
    Object[] values = parse(response, unitSeparator);
    
    for ( int i = 0; i < list.size(); i++ ) {
      list.get(i).set(this, values[i]);
    }
    
    return this;
  }
        `);
      }
    }
  ]

});
