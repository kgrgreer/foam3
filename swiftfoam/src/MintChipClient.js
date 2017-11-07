foam.CLASS({
  name: 'MintChipClient',
  extends: 'foam.box.Context',
  requires: [
    'MintChipSession',
    'foam.box.HTTPBox',
    'foam.box.Message',
    'foam.box.SessionClientBox',
    'foam.box.swift.FileBox',
    'foam.dao.ClientDAO',
    'foam.swift.parse.json.FObjectParser',
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
      `
    },
    {
      class: 'foam.dao.DAOProperty',
      name: 'transactionDAO',
      swiftFactory: `
return ClientDAO_create([
  "delegate": SessionClientBox_create([
    "delegate": HTTPBox_create([
      "url": "\\(self.httpBoxUrlRoot.rawValue)transactionDAO"
    ])
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
