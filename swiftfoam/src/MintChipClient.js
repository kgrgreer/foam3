foam.CLASS({
  name: 'MintChipClient',
  extends: 'foam.box.Context',
  requires: [
    'MintChipSession',
    'foam.box.HTTPBox',
    'foam.box.LogBox',
    'foam.box.Message',
    'foam.box.SessionClientBox',
    'foam.box.swift.FileBox',
    'foam.dao.ClientDAO',
    'foam.swift.parse.json.FObjectParser',
    'foam.nanos.auth.ClientAuthService',
    'net.nanopay.auth.token.ClientTokenService'
  ],
  properties: [
    {
      swiftType: 'URL',
      name: 'sessionPath',
      swiftFactory: `
return FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0].appendingPathComponent("MintChipSession")
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'MintChipSession',
      name: 'session',
      swiftFactory: `
if let str = try? String(contentsOf: sessionPath),
   let msg = FObjectParser_create().parseString(str) as? Message,
   let o = msg.object as? MintChipSession {
  return o
}
return MintChipSession_create()
      `,
    },
    {
      swiftType: 'ServiceURLs.Host',
      name: 'httpBoxUrlRoot',
      swiftFactory: `
return ServiceURLs.Host.Localhost
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'foam.nanos.auth.ClientAuthService',
      name: 'clientAuthService',
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
return ClientDAO_create([
  "delegate": SessionClientBox_create([
    "delegate": HTTPBox_create([
      "url": "\\(self.httpBoxUrlRoot.rawValue)userDAO"
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
      name: 'accountDAO',
      swiftFactory: `
return ClientDAO_create([
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
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.token.ClientTokenService',
      name: 'SMSService',
      swiftFactory: `
return ClientTokenService_create([
  "delegate": SessionClientBox_create([
    "delegate": HTTPBox_create([
      "url": "\\(self.httpBoxUrlRoot.rawValue)smsToken"
    ])
  ])
])
      `,
    },
    {
      class: 'FObjectProperty',
      of: 'net.nanopay.auth.token.ClientTokenService',
      name: 'EmailService',
      swiftFactory: `
return ClientTokenService_create([
  "delegate": SessionClientBox_create([
    "delegate": HTTPBox_create([
      "url": "\\(self.httpBoxUrlRoot.rawValue)emailToken"
    ])
  ])
])
      `,
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'countryDAO',
      swiftFactory: `
return ClientDAO_create([
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
  "delegate": HTTPBox_create([
    "url": "\\(self.httpBoxUrlRoot.rawValue)regionDAO"
  ])
])
      `,
    },
  ],
  axioms: [
    foam.pattern.Singleton.create(),
  ],
  listeners: [
    {
      name: 'onSessionChanged',
      isMerged: true,
      swiftCode: `
let box = FileBox_create(["path": sessionPath])
let msg = Message_create(["object": session])
try? box.send(msg)
      `,
    },
  ],
  methods: [
    {
      name: 'init',
      swiftCode: `
var sessionSub: Detachable?
onDetach(session$.swiftSub({ [weak self] _, _ in
  if self == nil { return }
  sessionSub?.detach()
  sessionSub = self!.session?.sub(listener: self!.onSessionChanged_listener)
  self!.onDetach(sessionSub)
  self!.onSessionChanged()
}))
      `,
    },
  ],
});
