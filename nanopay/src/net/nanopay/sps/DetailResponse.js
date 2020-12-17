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
  name: 'DetailResponse',
  extends: 'net.nanopay.sps.ResponsePacket',

  properties: [
    {
      class: 'Int',
      name: 'msgType',
      value: 20
    },
    {
      class: 'Int',
      name: 'packetNum',
      value: 2033
    },
    {
      class: 'Int',
      name: 'itemNum'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.sps.DetailResponseItemContent',
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
      name: 'batchId'
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
    'foam.core.*'
  ],

  axioms: [
    {
      name: 'javaExtras',
      buildJavaClass: function (cls) {
        cls.extras.push(`
  protected static List<PropertyInfo> detailInfoPropertyList;
  protected static List<PropertyInfo> batchInfoPropertyList;
  {
    detailInfoPropertyList = new ArrayList<>();
    detailInfoPropertyList.add(MSG_TYPE);
    detailInfoPropertyList.add(PACKET_NUM);
    detailInfoPropertyList.add(ITEM_NUM);
    detailInfoPropertyList.add(ITEM_CONTENT);
    batchInfoPropertyList = new ArrayList<>();
    batchInfoPropertyList.add(BATCH_MSG_TYPE);
    batchInfoPropertyList.add(BATCH_PACKET_TYPE);
    batchInfoPropertyList.add(MESSAGE_MODIFIER_CODE);
    batchInfoPropertyList.add(BATCH_STATUS_CODE);
    batchInfoPropertyList.add(TEXT_MSG);
    batchInfoPropertyList.add(HOST_SYNC_COUNTER);
    batchInfoPropertyList.add(BATCH_ID);
    batchInfoPropertyList.add(HOST_CHECK_APPROVAL_COUNT);
    batchInfoPropertyList.add(HOST_CHECK_APPROVAL_AMOUNT);
    batchInfoPropertyList.add(HOST_DECLINE_COUNT);
    batchInfoPropertyList.add(HOST_DECLINE_AMOUNT);
    batchInfoPropertyList.add(HOST_VOID_COUNT);
    batchInfoPropertyList.add(HOST_VOID_AMOUNT);
    batchInfoPropertyList.add(HOST_CREDIT_COUNT);
    batchInfoPropertyList.add(HOST_CREDIT_AMOUNT);
  }
  
  @Override
  public ResponsePacket parseSPSResponse(String response) {
    if ( response == null || response.length() == 0 ) {
      return null;
    }
    
    // remove STX and ETX
    response = response.substring(1, response.length() - 1);
  
    // separate two kinds of records  
    String[] lines = response.split("" + END_OF_TEXT + START_OF_TEXT);
    
    List<DetailResponseItemContent> itemList = new ArrayList<>();
    
    for ( int i = 0; i < lines.length - 1; i++ ) {
      String detailResponseInfo = lines[i];
  
      Object[] temp =  parse(detailResponseInfo, FIELD_SEPARATOR);
      for ( int j = 0; j < 3; j++ ) {
        detailInfoPropertyList.get(j).set(this, temp[j]);
      }
  
      Object[] items = parse(temp[3].toString(), RECORD_SEPARATOR);
    
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
    Object[] values =  parse(batchDetailInfo, FIELD_SEPARATOR);
    for ( int i = 0; i < values.length; i++ ) {
      batchInfoPropertyList.get(i).set(this, values[i]);
    }
    
    return this;
  }
        `);
      }
    }
  ]
});
