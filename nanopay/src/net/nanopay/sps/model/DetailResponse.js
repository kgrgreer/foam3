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
  System.out.println(lines.length);
  
  //String detailResponseInfo = lines[0];
  //System.out.println(detailResponseInfo);
  
  List<DetailResponseItemContent> itemList = new ArrayList<>();
  
  for ( int i = 0; i < lines.length - 1; i++ ) {
    String detailResponseInfo = lines[i];
    System.out.println(detailResponseInfo);
    
    char fieldSeparator = (char) 28;
    char unitSeparator = (char) 31;
    char recordSeparator = (char) 30;

    Object[] temp =  parse(detailResponseInfo, fieldSeparator);
    System.out.println("temp: " + Arrays.toString(temp));

    for (int j = 0; j < 3; j++) {
      detailInfoPropertyList.get(j).set(this, temp[j]);
    }

    Object[] items = parse(temp[3].toString(), recordSeparator);
    //DetailResponseItemContent[] itemArray = new DetailResponseItemContent[items.length];
  
    for ( int j = 0; j < items.length; j++ ) {
      DetailResponseItemContent detailResponseItemContent = new DetailResponseItemContent();
      detailResponseItemContent = (DetailResponseItemContent) detailResponseItemContent.parseSPSResponse(items[j].toString());
      System.out.println("itemContent: " + detailResponseItemContent);
      //itemArray[j] = detailResponseItemContent;
      itemList.add(detailResponseItemContent);
    }
  }
  
  DetailResponseItemContent[] itemArray = new DetailResponseItemContent[itemList.size()];
    for ( int i = 0; i < itemArray.length; i++ ) {
      itemArray[i] = itemList.get(i);
    }

  this.setItemContent(itemArray);
  
  String batchDetailInfo = lines[lines.length - 1];
  System.out.println(batchDetailInfo);

  // set BatchDetailGeneralResponse fields
  DetailResponse detailResponse = (DetailResponse) super.parseSPSResponse(batchDetailInfo);
  System.out.println("detailResponse: " + detailResponse.toString());
  
  return this;
}

        `);
      }
    }
  ]

});
