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

public ResponsePacket parseSPSResponse(String response) {
  if ( response == null || response.length() == 0 ) {
    return null;
  }
  
  Object[] values;
  
  char delimiter = (char) 31;
  StringPStream ps = new StringPStream();
  ps.setString(response);
  Parser parser = new Repeat(new SPSStringParser(), new Literal("" + delimiter));
  PStream ps1 = ps.apply(parser, null);
  if ( ps1 == null ) throw new RuntimeException("format error");
  
  values = (Object[]) ps1.value();
  
  for ( int i = 0; i < list.size(); i++ ) {
    list.get(i).set(this, list.get(i).fromString((String) values[i]));
  }
  
  return this;
}

private static class SPSStringParser implements Parser {
  private static char delimiter = (char) 31;
  public SPSStringParser() {}

  public PStream parse(PStream ps, ParserContext x) {
    if ( ps == null ) {
      return null;
    }

    char head;
    StringBuilder sb = new StringBuilder();

    while ( ps.valid() ) {
      head = ps.head();
      if ( head == delimiter ) {
        break;
      }
      sb.append(head);
      ps = ps.tail();
    }

    if ( ! ps.valid() && SafetyUtil.isEmpty(sb.toString()) ) {
      return null;
    }

    return ps.setValue(sb.toString());
  }
}
        `);
      }
    }
  ]

});
