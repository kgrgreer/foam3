foam.CLASS({
  package: 'net.nanopay.kotak',
  name: 'PaymentRequest',

  properties: [
    {
      class: 'String',
      name: 'messageId',
    },
    {
      class: 'String',
      name: 'msgSource'
    },
    {
      class: 'String',
      name: 'clientCode'
    },
    {
      class: 'String',
      name: 'batchRefNmbr'
    },
    {
      class: 'String',
      name: 'headerChecksum'
    },
    {
      class: 'String',
      name: 'reqRF1'
    },
    {
      class: 'String',
      name: 'reqRF2'
    },
    {
      class: 'String',
      name: 'reqRF3'
    },
    {
      class: 'String',
      name: 'reqRF4'
    },
    {
      class: 'String',
      name: 'reqRF5'
    },
    {
      class: 'String',
      name: 'instRefNo'
    },
    {
      class: 'String',
      name: 'companyId'
    },
    {
      class: 'String',
      name: 'compBatchId'
    },
    {
      class: 'String',
      name: 'confidentialInd'
    },
    {
      class: 'String',
      name: 'myProdCode',
      value: 'NETPAY'
    },
    {
      class: 'String',
      name: 'compTransNo'
    },
    {
      class: 'String',
      name: 'payMode'
    },
    {
      class: 'Long',
      name: 'txnAmnt'
    },
    {
      class: 'String',
      name: 'accountNo'
    },
    {
      class: 'String',
      name: 'drRefNmbr'
    },
    {
      class: 'String',
      name: 'drDesc'
    },
    {
      class: 'String',
      name: 'paymentDt'
    },
    {
      class: 'String',
      name: 'bankCdInd'
    },
    {
      class: 'String',
      name: 'beneBnkCd'
    },
    {
      class: 'String',
      name: 'recBrCd'
    },
    {
      class: 'String',
      name: 'beneAcctNo'
    },
    {
      class: 'String',
      name: 'beneName'
    },
    {
      class: 'String',
      name: 'beneCode'
    },
    {
      class: 'String',
      name: 'beneEmail'
    },
    {
      class: 'String',
      name: 'beneFax'
    },
    {
      class: 'String',
      name: 'beneMb'
    },
    {
      class: 'String',
      name: 'beneAddr1'
    },
    {
      class: 'String',
      name: 'beneAddr2'
    },
    {
      class: 'String',
      name: 'beneAddr3'
    },
    {
      class: 'String',
      name: 'beneAddr4'
    },
    {
      class: 'String',
      name: 'beneAddr5'
    },
    {
      class: 'String',
      name: 'city'
    },
    {
      class: 'String',
      name: 'zip'
    },
    {
      class: 'String',
      name: 'country',
      value: 'IN'
    },
    {
      class: 'String',
      name: 'state'
    },
    {
      class: 'String',
      name: 'telephoneNo'
    },
    {
      class: 'String',
      name: 'beneId'
    },
    {
      class: 'String',
      name: 'beneTaxId'
    },
    {
      class: 'String',
      name: 'authPerson'
    },
    {
      class: 'String',
      name: 'authPersonId'
    },
    {
      class: 'String',
      name: 'deliveryMode'
    },
    {
      class: 'String',
      name: 'payoutLoc'
    },
    {
      class: 'String',
      name: 'pickupBr'
    },
    {
      class: 'String',
      name: 'paymentRef'
    },
    {
      class: 'String',
      name: 'chgBorneBy'
    },
    {
      class: 'String',
      name: 'instDt'
    },
    {
      class: 'String',
      name: 'MICRNo'
    },
    {
      class: 'String',
      name: 'creditRefNo'
    },
    {
      class: 'String',
      name: 'paymentDtl'
    },
    {
      class: 'String',
      name: 'paymentDtl1'
    },
    {
      class: 'String',
      name: 'paymentDtl2'
    },
    {
      class: 'String',
      name: 'paymentDtl3'
    },
    {
      class: 'String',
      name: 'mailToAddr1'
    },
    {
      class: 'String',
      name: 'mailToAddr2'
    },
    {
      class: 'String',
      name: 'mailToAddr3'
    },
    {
      class: 'String',
      name: 'mailToAddr4'
    },
    {
      class: 'String',
      name: 'mailTo'
    },
    {
      class: 'String',
      name: 'exchDoc'
    },
    {
      class: 'String',
      name: 'instChecksum'
    },
    {
      class: 'String',
      name: 'instRF1'
    },
    {
      class: 'String',
      name: 'instRF2'
    },
    {
      class: 'String',
      name: 'instRF3'
    },
    {
      class: 'String',
      name: 'instRF4'
    },
    {
      class: 'String',
      name: 'instRF5'
    },
    {
      class: 'String',
      name: 'instRF6'
    },
    {
      class: 'String',
      name: 'instRF7'
    },
    {
      class: 'String',
      name: 'instRF8'
    },
    {
      class: 'String',
      name: 'instRF9'
    },
    {
      class: 'String',
      name: 'instRF10'
    },
    {
      class: 'String',
      name: 'instRF11'
    },
    {
      class: 'String',
      name: 'instRF12'
    },
    {
      class: 'String',
      name: 'instRF13'
    },
    {
      class: 'String',
      name: 'instRF14'
    },
    {
      class: 'String',
      name: 'instRF15'
    },
    {
      class: 'String',
      name: 'enrichment'
    }
  ]
});
