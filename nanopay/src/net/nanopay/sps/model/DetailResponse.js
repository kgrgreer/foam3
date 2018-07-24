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
  protected static List<PropertyInfo> batchInfo;
  {
  detailInfoPropertyList = new ArrayList<>();
  detailInfoPropertyList.add(MSG_TYPE);
  detailInfoPropertyList.add(PACKET_NUM);
  detailInfoPropertyList.add(ITEM_NUM);
  detailInfoPropertyList.add(ITEM_CONTENT);
  batchInfo = new ArrayList<>();
  batchInfo.add(BATCH_MSG_TYPE);
  batchInfo.add(BATCH_PACKET_TYPE);
  batchInfo.add(MESSAGE_MODIFIER_CODE);
  batchInfo.add(BATCH_STATUS_CODE);
  batchInfo.add(TEXT_MSG);
  batchInfo.add(HOST_SYNC_COUNTER);
  batchInfo.add(BATCH_ID);
  batchInfo.add(HOST_CHECK_APPROVAL_COUNT);
  batchInfo.add(HOST_CHECK_APPROVAL_AMOUNT);
  batchInfo.add(HOST_DECLINE_COUNT);
  batchInfo.add(HOST_DECLINE_AMOUNT);
  batchInfo.add(HOST_VOID_COUNT);
  batchInfo.add(HOST_VOID_AMOUNT);
  batchInfo.add(HOST_CREDIT_COUNT);
  batchInfo.add(HOST_CREDIT_AMOUNT);
  }
  
  @Override
  public ResponsePacket parseSPSResponse(String response) {
    if ( response == null || response.length() == 0 ) {
      return null;
    }
    
    // remove STX and ETX
    response = response.substring(1, response.length() - 1);
  
    // separate two kinds of records  
    String[] lines = response.split("" + (char) 3 + (char) 2);
    
    List<DetailResponseItemContent> itemList = new ArrayList<>();
    
    char fieldSeparator = (char) 28;
    char recordSeparator = (char) 30;
    
    for ( int i = 0; i < lines.length - 1; i++ ) {
      String detailResponseInfo = lines[i];
  
      Object[] temp =  parse(detailResponseInfo, fieldSeparator);
      for ( int j = 0; j < 3; j++ ) {
        detailInfoPropertyList.get(j).set(this, temp[j]);
      }
  
      Object[] items = parse(temp[3].toString(), recordSeparator);
    
      for (Object item : items) {
        DetailResponseItemContent detailResponseItemContent = new DetailResponseItemContent();
        detailResponseItemContent = (DetailResponseItemContent) detailResponseItemContent.parseSPSResponse(item.toString());
        itemList.add(detailResponseItemContent);
      }
    }
    
    DetailResponseItemContent[] itemArray = new DetailResponseItemContent[itemList.size()];
    for ( int i = 0; i < itemArray.length; i++ ) {
      itemArray[i] = itemList.get(i);
    }
  
    this.setItemContent(itemArray);
    
    // set BatchDetailGeneralResponse fields
    String batchDetailInfo = lines[lines.length - 1];  
    Object[] values =  parse(batchDetailInfo, fieldSeparator);
    for ( int i = 0; i < values.length; i++ ) {
      batchInfo.get(i).set(this, values[i]);
    }
    
    return this;
  }
        `);
      }
    }
  ]
});
