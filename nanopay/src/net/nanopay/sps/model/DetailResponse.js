foam.CLASS({
  package: 'net.nanopay.sps.model',
  name: 'DetailResponse',
  extends: 'net.nanopay.sps.model.ResponsePacket',

  properties: [
    {
      class: 'Int',
      name: 'msgType',
    },
    {
      class: 'Int',
      name: 'packetNum'
    },
    {
      class: 'Int',
      name: 'itemNum'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.sps.model.DetailResponseItemContent',
      name: 'itemContent'
    },
    {
      class: 'Int',
      name: 'batchMsgType'
    },
    {
      class: 'Int',
      name: 'batchPacketType'
    },
    {
      class: 'Int',
      name: 'messageModifierCode'
    },
    {
      class: 'String',
      name: 'batchStatusCode'
    },
    {
      class: 'String',
      name: 'textMsg'
    },
    {
      class: 'String',
      name: 'hostSyncCounter'
    },
    {
      class: 'String',
      name: 'batchID'
    },
    {
      class: 'String',
      name: 'hostCheckApprovalCount'
    },
    {
      class: 'String',
      name: 'hostCheckApprovalAmount'
    },
    {
      class: 'String',
      name: 'hostDeclineCount'
    },
    {
      class: 'String',
      name: 'hostDeclineAmount'
    },
    {
      class: 'String',
      name: 'hostVoidCount'
    },
    {
      class: 'String',
      name: 'hostVoidAmount'
    },
    {
      class: 'String',
      name: 'hostCreditCount'
    },
    {
      class: 'String',
      name: 'hostCreditAmount'
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
protected static List<PropertyInfo> detailInfoPropertyList;
{
list = new ArrayList<>();
detailInfoPropertyList = new ArrayList<>();
detailInfoPropertyList.add(MSG_TYPE);
detailInfoPropertyList.add(PACKET_NUM);
detailInfoPropertyList.add(ITEM_NUM);
detailInfoPropertyList.add(ITEM_CONTENT);
list.add(BATCH_MSG_TYPE);
list.add(BATCH_PACKET_TYPE);
list.add(MESSAGE_MODIFIER_CODE);
list.add(BATCH_STATUS_CODE);
list.add(TEXT_MSG);
list.add(HOST_SYNC_COUNTER);
list.add(BATCH_ID);
list.add(HOST_CHECK_APPROVAL_COUNT);
list.add(HOST_CHECK_APPROVAL_AMOUNT);
list.add(HOST_DECLINE_COUNT);
list.add(HOST_DECLINE_AMOUNT);
list.add(HOST_VOID_COUNT);
list.add(HOST_VOID_AMOUNT);
list.add(HOST_CREDIT_COUNT);
list.add(HOST_CREDIT_AMOUNT);
}

@Override
public ResponsePacket parseSPSResponse(String response) {
  if ( response == null || response.length() == 0 ) {
    return null;
  }
  
  // remove STX and ETX
  response = response.substring(1, response.length() - 1 );

  // separate two kinds of records  
  String[] lines = response.split("" + (char) 3 + (char) 2);
  
  String detailResponseInfo = lines[0];
  String batchDetailInfo = lines[1];

  // set BatchDetailGeneralResponse fields
  DetailResponse detailResponse = (DetailResponse) super.parseSPSResponse(batchDetailInfo);
  System.out.println("detailResponse: " + detailResponse.toString());
  
  
  char fieldSeparator = (char) 28;
  char unitSeparator = (char) 31;
  char recordSeparator = (char) 30;

  Object[] temp =  parse(detailResponseInfo, fieldSeparator);
  System.out.println("temp: " + temp);
  
  for (int i = 0; i < 3; i++) {
    detailInfoPropertyList.get(i).set(this, temp[i]);
  }
  
  DetailResponseItemContent detailResponseItemContent = new DetailResponseItemContent();
  DetailResponseItemContent itemContent = (DetailResponseItemContent) detailResponseItemContent.parseSPSResponse(temp[3].toString());
  System.out.println("itemContent: " + itemContent);
  
 
  DetailResponseItemContent[] itemArray = new DetailResponseItemContent[1];
  
  itemArray[0] = itemContent;
    
  this.setItemContent(itemArray);
  
  return this;
}

private Object[] parse(String str, char delimiter) {
  Object[] values;
  StringPStream ps = new StringPStream();
  ps.setString(str);
  Parser parser = new Repeat(new SPSStringParser(delimiter), new Literal("" + delimiter));
  PStream ps1 = ps.apply(parser, null);
  if ( ps1 == null ) throw new RuntimeException("format error");

  values = (Object[]) ps1.value();

  return values;
}

private static class SPSStringParser implements Parser {
  private char delimiter;
  public SPSStringParser(char delimiter) {
    this.delimiter = delimiter;
  }

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
