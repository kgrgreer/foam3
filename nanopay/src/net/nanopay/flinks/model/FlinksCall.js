/**
 * @license
 * Copyright 2017 The FOAM Authors. All Rights Reserved.
 * http://www.apache.org/licenses/LICENSE-2.0
 */
foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksCall',
  documentation: 'model for Flinks Call',
  abstract: 'true'
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksRequest',
  extends: 'net.nanopay.flinks.model.FlinksCall',
  abstract: 'true',

  documentation: 'model for Flinks request',

  properties:[
    {
      class: 'String',
      name: 'CustomerId'
    },
    {
      class: 'String',
      name: 'RequestId'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAuthRequest',
  extends: 'net.nanopay.flinks.model.FlinksRequest',

  documentation: 'model for Flinks authorize request',

  properties: [
    {
      class: 'String',
      name: 'LoginId'
    },
    {
      class: 'String',
      name: 'Username'
    },
    {
      class: 'String',
      name: 'Password'
    },
    {
      class: 'String',
      name: 'Institution'
    },
    {
      class: 'String',
      name: 'Language'
    },
    {
      //key: MFA, value: MFA answer 
      class: 'Map',
      name: 'SecurityResponses'
    },
    {
      class: 'Boolean',
      name: 'save'
    },
    {
      class: 'Boolean',
      name: 'ScheduleRefresh'
    },
    {
      class: 'Boolean',
      name: 'DirectRefresh'
    },
    {
      class: 'Boolean',
      name: 'MostRecentCached'
    },
    {
      class: 'Boolean',
      name: 'WithTransactions'
    },
    {
      class: 'Boolean',
      name: 'WithBalance'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksTransactionRequest',
  extends: 'net.nanopay.flinks.model.FlinksRequest',
  abstract: 'true',

  documentation: 'model for Flinks account request',

  properties: [
    {
      class: 'Boolean',
      name: 'MostRecent'
    },
    {
      class: 'Boolean',
      name: 'MostRecentCached'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountRequest',
  extends: 'net.nanopay.flinks.model.FlinksTransactionRequest',
  abstract: 'true',

  documentation: 'model for Flinks Transaction',

  properties: [
    {
      class: 'Boolean',
      name: 'WithBalance'
    },
    {
      class: 'Boolean',
      name: 'WithTransactions'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountSummaryRequest',
  extends: 'net.nanopay.flinks.model.FlinksAccountRequest',

  documentation: 'model for Flinks Account Summary Request',

  properties: [
    {
      class: 'Boolean',
      name: 'DirectRefresh'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'RefreshDeltaModel',

  documentation: 'model for Flinks Refresh Delta',

  properties: [
    {
      class: 'String',
      name: 'AccountId'
    },
    {
      class: 'String',
      name: 'TransactionId'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountDetailRequest',
  extends: 'net.nanopay.flinks.model.FlinksAccountRequest',

  documentation: 'model for Flinks Account Detail Request',

  properties: [
    {
      class: 'Boolean',
      name: 'WithAccountIdentity'
    },
    {
      class: 'String',
      name: 'DateFrom'
    },
    {
      class: 'String',
      name: 'DateTo'
    },
    {
      class: 'Array',
      of: 'String',
      name: 'AccountsFilter'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.RefreshDeltaModel',
      name: 'RefreshDelta'
    },
    {
      class: 'String',
      name: 'DaysOfTransactions'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksMulAuthRequest',
  extends: 'net.nanopay.flinks.model.FlinksCall',

  documentation: 'model for Flinks multiple authrize request',

  properties: [
    {
      class: 'Array',
      of: 'String',
      name: 'LoginIds'
    }
  ]
});

//instance create when HttpStatusCode is not 200, contain all invalid login info
foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksResponse',
  extends: 'net.nanopay.flinks.model.FlinksCall',

  documentation: 'model for Flinks Response',

  properties: [
    {
      class: 'Int',
      name: 'HttpStatusCode'
    },
    {
      class: 'String',
      name: 'FlinksCode'
    },
    {
      class: 'String',
      name: 'Message'
    },
    {
      javaType: 'foam.lib.json.UnknownFObjectArray',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectArrayParser()',
      name: 'Links'
    },
    {
      javaType: 'foam.lib.json.UnknownFObjectArray',
      javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      javaJSONParser: 'new foam.lib.json.UnknownFObjectArrayParser()',
      name: 'ValidationDetails'
    },
    {
      class: 'String',
      name: 'RequestId'
    },
    {
      //javaType: 'net.nanopay.flinks.model.LoginModel',
      //javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      //javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.LoginModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.LoginModel',
      name: 'Login'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksInvalidResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',
  
  documentation: 'model for Flinks Error Response'
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksMFAResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',

  documentation: 'model for Flinks MFA response',

  properties: [
    {
      class: 'String',
      name: 'Institution'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.SecurityChallengeModel',
      name: 'SecurityChallenges'
    }
  ]
  
})

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAuthResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',

  documentation: 'model for Flinks success authorized response',

  properties: [
    {
      class: 'String',
      name: 'Institution'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountsSummaryResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',

  documentation: 'model for Flinks accounts summary response',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.AccountModel',
      name: 'Accounts'
    },
    {
      class: 'String',
      name: 'Institution'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'FlinksAccountsDetailResponse',
  extends: 'net.nanopay.flinks.model.FlinksResponse',

  documentation: 'model for Flinks accounts detail response',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.AccountWithDetailModel',
      name: 'Accounts'
    }
  ]
});

//instance when Http status code is 200
foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'LoginModel',

  documentation: 'model for Flinks Login',

  properties: [
    {
      class: 'String',
      name: 'Username'
    },
    {
      class: 'Boolean',
      name: 'IsScheduledRefresh'
    },
    {
      class: 'String',
      name: 'LastRefresh'
    },
    {
      class: 'String',
      name: 'Id'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'BalanceModel',

  documentation: 'model for Flinks account balance',

  properties: [
    {
      class: 'Double',
      name: 'Available'
    },
    {
      class: 'Double',
      name: 'Current'
    },
    {
      class: 'Double',
      name: 'Limit'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AddressModel',

  documentation: 'model for the Flinks address mode',

  properties: [
    {
      class: 'String',
      name: 'CivicAddress'
    },
    {
      class: 'String',
      name: 'City'
    },
    {
      class: 'String',
      name: 'Province'
    },
    {
      class: 'String',
      name: 'PostalCode'
    },
    {
      class: 'String',
      name: 'POBox'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'HolderModel',

  documentation: 'model for Flinks account holder',

  properties: [
    {
      class: 'String',
      name: 'Name'
    },
    {
      // javaType: 'net.nanopay.flinks.model.AddressModel',
      // javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      // javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.AddressModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.AddressModel',
      name: 'Address'
    },
    {
      class: 'String',
      name: 'Email'
    },
    {
      class: 'String',
      name: 'PhoneNumber'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountTransactionModel',

  documentation: 'model for the Flinks account transaction model',

  properties: [
    {
      class: 'String',
      name: 'Date'
    },
    {
      class: 'String',
      name: 'Code'
    },
    {
      class: 'String',
      name: 'Description'
    },
    {
      class: 'Double',
      name: 'Debit'
    },
    {
      class: 'Double',
      name: 'Credit'
    },
    {
      class: 'Double',
      name: 'Balance'
    },
    {
      class: 'String',
      name: 'Id'
    }
  ]
});


foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountModel',

  documentation: 'model for Flinks account model',

  imports: [ 'bankAccountDAO' ],
  
  javaImports: [
    'foam.dao.DAO',
    'net.nanopay.model.BankAccount',
    'java.util.Random'
  ],

  properties: [
    {
      class: 'String',
      name: 'Title'
    },
    {
      class: 'String',
      name: 'AccountNumber'
    },
    {
      class: 'String',
      name: 'Category'
    },
    {
      class: 'String',
      name: 'Currency'
    },
    {
      class: 'String',
      name: 'Id'
    },
    //maybe dangerous if property=null or property={}
    {
      // javaType: 'net.nanopay.flinks.model.BalanceModel',
      // javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      // javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.BalanceModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.BalanceModel',
      name: 'Balance'
    }
  ],

  methods: [
    {
      name: 'generateBankAccount',
      javaReturns: 'net.nanopay.model.BankAccount',
      javaCode:
`DAO bankAccountDAO = (DAO) getX().get("bankAccountDAO");
BankAccount account = new BankAccount();
Random rand = new Random();
account.setId(rand.nextLong());
account.setX(getX());
account.setAccountNumber(getAccountNumber());
account.setCurrencyCode(getCurrency());
account.setAccountName(getTitle());
try {
  bankAccountDAO.put(account);
} catch ( Throwable t ) {
  System.out.println("bank account same name");
}
return account;
`
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountWithDetailModel',
  extends: 'net.nanopay.flinks.model.AccountModel',

  documentation: 'model for the Flinks account with detail model',

  properties: [
    {
      // javaType: 'net.nanopay.flinks.model.HolderModel',
      // javaInfoType: 'foam.core.AbstractFObjectPropertyInfo',
      // javaJSONParser: 'new foam.lib.json.FObjectParser(net.nanopay.flinks.model.HolderModel.class)',
      class: 'FObjectProperty',
      of: 'net.nanopay.flinks.model.HolderModel',
      name: 'Holder'
    },
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.AccountTransactionModel',
      name: 'Transactions'
    },
    {
      class: 'String',
      name: 'TransitNumber'
    },
    {
      class: 'String',
      name: 'InstitutionNumber'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountStatementModel',

  documentation: 'model for the Flinks account statement model',

  properties: [
    {
      class: 'String',
      name: 'UniqueId'
    },
    {
      class: 'String',
      name: 'FileType'
    },
    {
      class: 'String',
      name: 'Base64Bytes'
    }
  ]
});

foam.CLASS({
  package: 'net.nanopay.flinks.model',
  name: 'AccountStatementContainerModel',

  documentation: 'model for the Flinks account statment container model',

  properties: [
    {
      class: 'FObjectArray',
      of: 'net.nanopay.flinks.model.AccountStatementModel',
      name: 'Statements'
    },
    {
      class: 'String',
      name: 'AccountNumber'
    }
  ]
});