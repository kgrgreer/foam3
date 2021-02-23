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
  name: 'DetailResponseItemContent',
  extends: 'net.nanopay.sps.ResponsePacket',

  properties: [
    {
      class: 'String',
      name: 'itemId',
    },
    {
      class: 'String',
      name: 'originalRequestStatus',
      documentation: '1 - Check/electronic transaction, 2 - decline, 3 - voided, 4 - credit'
    },
    {
      class: 'String',
      name: 'manualEntryIndicator'
    },
    {
      class: 'String',
      name: 'localTxnTime'
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
      name: 'clerkId'
    }
  ],

  javaImports: [
    'java.util.*'
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
    list.add(LOCAL_TXN_TIME);
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
    
    Object[] values = parse(response, UNIT_SEPARATOR);
    
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
