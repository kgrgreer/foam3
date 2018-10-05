foam.CLASS({
  name: 'MintChipClient',
  extends: 'foam.box.Context',

  requires: [
    'foam.box.HTTPBox',
    'foam.box.LogBox',
    'foam.box.Message',
    'foam.box.SessionClientBox',
    'foam.box.swift.FileBox',
    'foam.dao.ClientDAO',
    'foam.dao.DAOSink',
    'foam.nanos.auth.ClientAuthService',
    'foam.nanos.fs.File',
    'foam.swift.dao.ArrayDAO',
    'foam.swift.dao.CachingDAO',
    'foam.swift.parse.json.FObjectParser',
    'foam.nanos.auth.token.ClientTokenService',
    'net.nanopay.model.PadCapture',
    'net.nanopay.tx.client.ClientUserTransactionLimitService',
    'net.nanopay.cico.service.ClientBankAccountVerifierService'
  ],

  exports: [
    'userDAO',
    'currentUser',
    'padCaptureDAO',
    'refreshTransactionDAO',
    'transactionDAO',
    'stripeTransactionDAO',
    'partnerJunctionDAO'
  ],

  classes: [
    {
      name: 'UserDAODecorator',
      extends: 'foam.dao.ProxyDAO',
      imports: [
        {
          name: 'currentUser',
          key: 'currentUser',
          swiftType: 'foam_nanos_auth_User?',
        },
      ],
      methods: [
        {
          name: 'put',
          swiftCode: `
let putObj = try delegate.put(obj) as? foam_nanos_auth_User
if currentUser != nil && putObj != nil && FOAM_utils.equals(currentUser!.id, putObj!.id) {
  currentUser = putObj
}
return putObj
          `,
        },
      ],
    },
  ],

  properties: [
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.User',
      name: 'currentUser',
      swiftExpressionArgs: ['clientAuthService'],
      swiftExpression: `
return (try? clientAuthService.getCurrentUser(self.__subContext__)) ?? nil
      `,
    },
    {
      swiftType: 'ServiceURLs.Host',
      name: 'httpBoxUrlRoot',
      swiftFactory: `
return ServiceURLs.hostRoute
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.ClientAuthService',
      name: 'clientAuthService',
      required: true,
      swiftFactory: `
return ClientAuthService_create([
  "serviceName": "\\(self.httpBoxUrlRoot.rawValue)auth"
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'userDAO',
      swiftFactory: `
// TODO: Nuke this UserDAODecorator in favor of listening to a dao when we're
// able to.
return UserDAODecorator_create([
  "delegate": ClientDAO_create([
    "of": foam_nanos_auth_User.classInfo(),
    "delegate": SessionClientBox_create([
      "delegate": HTTPBox_create([
        "url": "\\(self.httpBoxUrlRoot.rawValue)userDAO"
      ])
    ])
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'shopperRegistrationDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": foam_nanos_auth_User.classInfo(),
  "delegate": HTTPBox_create([
    "url": "\\(self.httpBoxUrlRoot.rawValue)shopperRegistrationDAO"
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'stripeTransactionDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": net_nanopay_tx_model_Transaction.classInfo(),
  "delegate": LogBox_create([
    "delegate": SessionClientBox_create([
      "delegate": HTTPBox_create([
        "url": "\\(self.httpBoxUrlRoot.rawValue)stripeTransactionDAO"
      ])
    ])
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'transactionLimitDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": net_nanopay_tx_model_TransactionLimit.classInfo(),
  "delegate": LogBox_create([
    "delegate": HTTPBox_create([
      "url": "\\(self.httpBoxUrlRoot.rawValue)transactionLimitDAO"
    ])
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'accountDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": net_nanopay_account_Account.classInfo(),
  "delegate": LogBox_create([
    "delegate": SessionClientBox_create([
      "delegate": HTTPBox_create([
        "url": "\\(self.httpBoxUrlRoot.rawValue)accountDAO"
      ])
    ])
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'branchDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": net_nanopay_model_Branch.classInfo(),
  "delegate": LogBox_create([
    "delegate": SessionClientBox_create([
      "delegate": HTTPBox_create([
        "url": "\\(self.httpBoxUrlRoot.rawValue)branchDAO"
      ])
    ])
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'institutionDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": net_nanopay_payment_Institution.classInfo(),
  "delegate": LogBox_create([
    "delegate": SessionClientBox_create([
      "delegate": HTTPBox_create([
        "url": "\\(self.httpBoxUrlRoot.rawValue)institutionDAO"
      ])
    ])
  ])
])
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'balanceDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": net_nanopay_account_Balance.classInfo(),
  "delegate": LogBox_create([
    "delegate": SessionClientBox_create([
      "delegate": HTTPBox_create([
        "url": "\\(self.httpBoxUrlRoot.rawValue)balanceDAO"
      ])
    ])
  ])
])
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.tx.client.ClientUserTransactionLimitService',
      name: 'userTransactionLimitService',
      swiftFactory: `
return ClientUserTransactionLimitService_create([
  "delegate": LogBox_create([
    "delegate": SessionClientBox_create([
      "delegate": HTTPBox_create([
        "url": "\\(self.httpBoxUrlRoot.rawValue)userTransactionLimit"
      ])
    ])
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'paymentCardDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": net_nanopay_cico_paymentCard_model_PaymentCard.classInfo(),
  "delegate": LogBox_create([
    "delegate": SessionClientBox_create([
      "delegate": HTTPBox_create([
        "url": "\\(self.httpBoxUrlRoot.rawValue)paymentCardDAO"
      ])
    ])
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'transactionDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": net_nanopay_tx_model_Transaction.classInfo(),
  "delegate": LogBox_create([
    "delegate": SessionClientBox_create([
      "delegate": HTTPBox_create([
        "url": "\\(self.httpBoxUrlRoot.rawValue)transactionDAO"
      ])
    ])
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'P2PTxnRequestDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": net_nanopay_retail_model_P2PTxnRequest.classInfo(),
  "delegate": LogBox_create([
    "delegate": SessionClientBox_create([
      "delegate": HTTPBox_create([
        "url": "\\(self.httpBoxUrlRoot.rawValue)P2PTxnRequestDAO"
      ])
    ])
  ])
])
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.token.ClientTokenService',
      name: 'smsService',
      swiftFactory: `
return ClientTokenService_create([
  "serviceName": "\\(self.httpBoxUrlRoot.rawValue)smsToken"
])
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.token.ClientTokenService',
      name: 'emailService',
      swiftFactory: `
return ClientTokenService_create([
  "serviceName": "\\(self.httpBoxUrlRoot.rawValue)emailToken"
])
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.token.ClientTokenService',
      name: 'resetPasswordService',
      swiftFactory: `
return ClientTokenService_create([
  "serviceName": "\\(self.httpBoxUrlRoot.rawValue)resetPasswordToken"
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'countryDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": foam_nanos_auth_Country.classInfo(),
  "delegate": HTTPBox_create([
    "url": "\\(self.httpBoxUrlRoot.rawValue)countryDAO"
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'regionDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": foam_nanos_auth_Region.classInfo(),
  "delegate": HTTPBox_create([
    "url": "\\(self.httpBoxUrlRoot.rawValue)regionDAO"
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'partnerJunctionDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": foam_nanos_auth_UserUserJunction.classInfo(),
  "delegate": SessionClientBox_create([
    "delegate": HTTPBox_create([
      "url": "\\(self.httpBoxUrlRoot.rawValue)partnerJunctionDAO"
    ])
  ])
])
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'invitationDAO',
      swiftFactory: `
      return ClientDAO_create([
        "of": net_nanopay_model_Invitation.classInfo(),
        "delegate": SessionClientBox_create([
          "delegate": HTTPBox_create([
            "url": "\\(self.httpBoxUrlRoot.rawValue)invitationDAO"
          ])
        ])
      ])
      `
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.token.ClientTokenService',
      name: 'firebaseInviteToken',
      swiftFactory: `
return ClientTokenService_create([
  "serviceName": "\\(self.httpBoxUrlRoot.rawValue)firebaseInviteToken"
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'fileDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": foam_nanos_fs_File.classInfo(),
  "delegate": SessionClientBox_create([
    "delegate": HTTPBox_create([
      "url": "\\(self.httpBoxUrlRoot.rawValue)fileDAO"
    ])
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'padCaptureDAO',
      swiftFactory: `
return ClientDAO_create([
  "of": net_nanopay_model_PadCapture.classInfo(),
  "delegate": SessionClientBox_create([
    "delegate": HTTPBox_create([
      "url": "\\(self.httpBoxUrlRoot.rawValue)padCaptureDAO"
    ])
  ])
])
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.cico.service.ClientBankAccountVerifierService',
      name: 'bankAccountVerification',
      swiftFactory: `
return ClientBankAccountVerifierService_create([
  "delegate": SessionClientBox_create([
    "delegate": HTTPBox_create([
      "url": "\\(self.httpBoxUrlRoot.rawValue)bankAccountVerification"
    ])
  ])
])
      `
    }
  ],
  methods: [
    {
      name: 'login',
      args: [
        {
          swiftType: 'String',
          name: 'email',
        },
        {
          swiftType: 'String',
          name: 'password',
        },
      ],
      swiftThrows: true,
      returns: 'foam.nanos.auth.User',
      swiftCode: `
clearProperty("currentUser")
let u = try clientAuthService.loginByEmail(__context__, email, password)
currentUser = u
return u
      `,
    },
    {
      name: 'logout',
      swiftThrows: true,
      swiftCode: `
try clientAuthService.logout(__context__)
clearProperty("currentUser")
      `,
    },
    {
      name: 'refreshTransactionDAO',
      swiftCode: `
let dao = self.transactionDAO as! foam_swift_dao_CachingDAO
_ = try? dao.src.select(DAOSink_create(["dao": dao.cache]))
      `,
    },
    {
      name: 'getBankAccounts',
      swiftThrows: true,
      args: [
        {
          of: 'Boolean',
          swiftType: 'Bool',
          name: 'verifiedOnly',
          swiftDefaultValue: 'false'
        }
      ],
      swiftReturns: '[net_nanopay_bank_CABankAccount]',
      swiftCode: `
let user = try clientAuthService.getCurrentUser(__context__)!

let x = __subContext__
let pred = x.create(foam_mlang_predicate_And.self, args: [
  "args": [
    x.create(foam_mlang_predicate_Eq.self, args: [
      "arg1": net_nanopay_account_Account.OWNER(),
      "arg2": user.id
    ]),
    x.create(foam_mlang_predicate_Eq.self, args: [
      "arg1": net_nanopay_account_Account.DENOMINATION(),
      "arg2": "CAD"
    ])
  ]
])
if verifiedOnly {
  pred?.args.append(x.create(foam_mlang_predicate_Eq.self, args: [
    "arg1": net_nanopay_bank_CABankAccount.STATUS(),
    "arg2": net_nanopay_bank_BankAccountStatus.VERIFIED
    ])!)
}

var accounts = try accountDAO!.\`where\`(pred).select().array as! [net_nanopay_account_Account]
accounts = accounts.filter({
  (account) -> Bool in
  if account is net_nanopay_bank_CABankAccount {
    return true
  }
  return false
})
var caBankAccounts: [net_nanopay_bank_CABankAccount] = []
for account in accounts {
  if account is net_nanopay_bank_CABankAccount {
    let account = account as! net_nanopay_bank_CABankAccount
    account.institutionNumber = try ((institutionDAO!.find(account.institution)) as! net_nanopay_payment_Institution).institutionNumber
    caBankAccounts.append(account)
  }
}

return caBankAccounts
      `
    },
    {
      name: 'getDefaultDigitalAccount',
      swiftThrows: true,
      swiftReturns: 'net_nanopay_account_DigitalAccount',
      swiftCode: `
let user = try clientAuthService.getCurrentUser(__context__)!

let x = __context__
let pred = x.create(foam_mlang_predicate_And.self, args: [
  "args": [
    x.create(foam_mlang_predicate_Eq.self, args: [
      "arg1": net_nanopay_account_Account.DENOMINATION(),
      "arg2": "CAD"
      ]),
    x.create(foam_mlang_predicate_Eq.self, args: [
      "arg1": net_nanopay_account_Account.IS_DEFAULT(),
      "arg2": true
      ]),
    x.create(foam_mlang_predicate_Eq.self, args: [
      "arg1": net_nanopay_account_Account.OWNER(),
      "arg2": user.id
      ])
  ]
])

let accounts = try accountDAO!.\`where\`(pred).select().array as! [net_nanopay_account_Account]

for account in accounts {
  if account is net_nanopay_account_DigitalAccount {
    return account as! net_nanopay_account_DigitalAccount
  }
}

throw "No Digital Account Found"
      `
    },
    {
      name: 'getCurrentBalance',
      //documentation: 'Will be removed in rebuild of MintChip to factor in multiple accounts'
      swiftThrows: true,
      swiftReturns: 'Int',
      swiftCode: `
let user = try clientAuthService.getCurrentUser(__context__)!

let x = __context__
let pred = x.create(foam_mlang_predicate_And.self, args: [
  "args": [
    x.create(foam_mlang_predicate_Eq.self, args: [
      "arg1": net_nanopay_account_Account.DENOMINATION(),
      "arg2": "CAD"
      ]),
    x.create(foam_mlang_predicate_Eq.self, args: [
      "arg1": net_nanopay_account_Account.IS_DEFAULT(),
      "arg2": true
      ]),
    x.create(foam_mlang_predicate_Eq.self, args: [
      "arg1": net_nanopay_account_Account.OWNER(),
      "arg2": user.id
      ])
  ]
])

var accounts = try accountDAO!.\`where\`(pred).select().array as! [net_nanopay_account_Account]

accounts = accounts.filter({
  (account) -> Bool in
  if account is net_nanopay_account_DigitalAccount {
    return true
  }
  return false
})

let currentBalanceRaw = try balanceDAO!.find(accounts[0].id)
guard currentBalanceRaw != nil else {
  return 0
}

let currentBalance = currentBalanceRaw as! net_nanopay_account_Balance
return currentBalance.balance
      `
    }
  ],
});
