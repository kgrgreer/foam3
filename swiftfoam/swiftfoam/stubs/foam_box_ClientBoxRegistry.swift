// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class ClientBoxRegistry: AbstractFObject, BoxRegistryInterface {

  public var delegate: Box {
    get {
      
if _delegate_inited_ {
  return _delegate_!
}

fatalError("No default value for delegate")

      
    }
set(value) {
      
self.set(key: "delegate", value: value)
      
    }
  }

  var _delegate_: Box! = nil

  var _delegate_inited_: Bool = false

  public static let DELEGATE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "delegate"
  let classInfo: ClassInfo
  let transient = false
  let label = "Delegate" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var delegate_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "delegate",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var delegate_Value_Sub_: Subscription?

  public var delegate$: Slot {
    get {
      return self.delegate_Value_
    }
set(value) {
      
self.delegate_Value_Sub_?.detach()
self.delegate_Value_Sub_ = self.delegate$.linkFrom(value)
self.onDetach(self.delegate_Value_Sub_!)
      
    }
  }

  public var delegateReplyPolicy: Any? {
    get {
      
if _delegateReplyPolicy_inited_ {
  return _delegateReplyPolicy_
}

return nil

      
    }
set(value) {
      
self.set(key: "delegateReplyPolicy", value: value)
      
    }
  }

  var _delegateReplyPolicy_: Any? = nil

  var _delegateReplyPolicy_inited_: Bool = false

  public static let DELEGATE_REPLY_POLICY: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "delegateReplyPolicy"
  let classInfo: ClassInfo
  let transient = false
  let label = "Delegate Reply Policy" // TODO localize
  let visibility = Visibility.RW
  lazy private(set) public var jsonParser: Parser? = AnyParser()

  let viewFactory: ((Context) -> FObject)? = nil

  public func set(_ obj: FObject, value: Any?) {
    obj.set(key: name, value: value)
  }
  public func get(_ obj: FObject) -> Any? {
    return obj.get(key: name)
  }
  public func compareValues(_ v1: Any?, _ v2: Any?) -> Int {
    
let v1 = v1 as AnyObject
let v2 = v2 as AnyObject
if v1.isEqual(v2) { return 0 }
return v1.hash ?? 0 > v2.hash ?? 0 ? 1 : -1
        
  }
  init(_ ci: ClassInfo) { classInfo = ci }
}
return PInfo(classInfo())
      
  }()

  private lazy var delegateReplyPolicy_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "delegateReplyPolicy",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var delegateReplyPolicy_Value_Sub_: Subscription?

  public var delegateReplyPolicy$: Slot {
    get {
      return self.delegateReplyPolicy_Value_
    }
set(value) {
      
self.delegateReplyPolicy_Value_Sub_?.detach()
self.delegateReplyPolicy_Value_Sub_ = self.delegateReplyPolicy$.linkFrom(value)
self.onDetach(self.delegateReplyPolicy_Value_Sub_!)
      
    }
  }

  lazy var doLookup$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let name = args[0] as! String

    
    return try self!.`doLookup`(
        _: name)
  }
])
      
  }()

  public static let DO_LOOKUP: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "doLookup"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var register$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let name = args[0] as! String

    let service = args[1] as! BoxService?

    let localBox = args[2] as! Box

    
    return self!.`register`(
        _: name, _: service, _: localBox)
  }
])
      
  }()

  public static let REGISTER: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "register"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var unregister$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let name = args[0] as! String

    
    return self!.`unregister`(
        _: name)
  }
])
      
  }()

  public static let UNREGISTER: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "unregister"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  public var registry: Any? {
    get {
      
return __context__["registry"]
      
    }
set(value) {
      
self.registry$?.swiftSet(value)
      
    }
  }

  public var registry$: Slot? {
    get {
      
return __context__["registry$"] as? Slot ?? nil
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_delegate_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Box {
    return newValue as! Box
  }

  private func `_delegate_preSet_`(_ oldValue: Any?, _ newValue: Box) -> Box {
    return newValue
  }

  private func `_delegate_postSet_`(_ oldValue: Any?, _ newValue: Box) {
    
  }

  private func `_delegateReplyPolicy_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_delegateReplyPolicy_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_delegateReplyPolicy_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  public func `doLookup`(_ name: String) throws -> Box {
    

let replyBox = ReplyBox_create([
  "delegate": RPCReturnBox_create()
])
let registeredReplyBox = (registry as! BoxRegistryInterface).register(
  replyBox.id,
  delegateReplyPolicy as? BoxService,
  replyBox)


let msg = Message_create([
  "object": RPCMessage_create([
    "name": "doLookup",
    "args": [name] as [Any?],
  ]),
])


msg.attributes["replyBox"] = registeredReplyBox
msg.attributes["errorBox"] = registeredReplyBox


try? delegate.send(msg)


  
if let o = (try? (replyBox.delegate as? RPCReturnBox)?.future.get()) as? Box {
  return o
}
fatalError()
  

      
  }

  public func `register`(_ name: String, _ service: BoxService?, _ localBox: Box) -> Box {
    

let replyBox = ReplyBox_create([
  "delegate": RPCReturnBox_create()
])
let registeredReplyBox = (registry as! BoxRegistryInterface).register(
  replyBox.id,
  delegateReplyPolicy as? BoxService,
  replyBox)


let msg = Message_create([
  "object": RPCMessage_create([
    "name": "register",
    "args": [name, service, localBox] as [Any?],
  ]),
])


msg.attributes["replyBox"] = registeredReplyBox
msg.attributes["errorBox"] = registeredReplyBox


try? delegate.send(msg)


  
if let o = (try? (replyBox.delegate as? RPCReturnBox)?.future.get()) as? Box {
  return o
}
fatalError()
  

      
  }

  public func `unregister`(_ name: String) {
    


let msg = Message_create([
  "object": RPCMessage_create([
    "name": "unregister",
    "args": [name] as [Any?],
  ]),
])



try? delegate.send(msg)


      
  }

  public func `RPCReturnBox_create`(_ args: [String:Any?] = [:]) -> RPCReturnBox {
    
return __subContext__.create(RPCReturnBox.self, args: args)!
      
  }

  public func `ReplyBox_create`(_ args: [String:Any?] = [:]) -> ReplyBox {
    
return __subContext__.create(ReplyBox.self, args: args)!
      
  }

  public func `RPCMessage_create`(_ args: [String:Any?] = [:]) -> RPCMessage {
    
return __subContext__.create(RPCMessage.self, args: args)!
      
  }

  public func `Message_create`(_ args: [String:Any?] = [:]) -> Message {
    
return __subContext__.create(Message.self, args: args)!
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return ClientBoxRegistry.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return ClientBoxRegistry.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "delegate":
    _delegate_inited_ = false
    _delegate_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "delegate"]) {
      _ = pub(["propertyChange", "delegate", delegate$])
    }
    break

  case "delegateReplyPolicy":
    _delegateReplyPolicy_inited_ = false
    _delegateReplyPolicy_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "delegateReplyPolicy"]) {
      _ = pub(["propertyChange", "delegateReplyPolicy", delegateReplyPolicy$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "delegate": return `_delegate_inited_`

  case "delegateReplyPolicy": return `_delegateReplyPolicy_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "delegate": return `delegate`

  case "delegateReplyPolicy": return `delegateReplyPolicy`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "delegate": return `delegate$`

  case "delegateReplyPolicy": return `delegateReplyPolicy$`


  case "doLookup": return `doLookup$`

  case "register": return `register$`

  case "unregister": return `unregister$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "delegate$":
    delegate$ = value as! Slot
    return
  case "delegate":
  
    let oldValue: Any? = _delegate_inited_ ? self.`delegate` : nil
    _delegate_ = _delegate_preSet_(oldValue, _delegate_adapt_(oldValue, value))
    _delegate_inited_ = true
    _delegate_postSet_(oldValue, _delegate_)
    if hasListeners(["propertyChange", "delegate"]) && !FOAM_utils.equals(oldValue, _delegate_) {
      _ = pub(["propertyChange", "delegate", delegate$])
    }
    return

  case "delegateReplyPolicy$":
    delegateReplyPolicy$ = value as! Slot
    return
  case "delegateReplyPolicy":
  
    let oldValue: Any? = _delegateReplyPolicy_inited_ ? self.`delegateReplyPolicy` : nil
    _delegateReplyPolicy_ = _delegateReplyPolicy_preSet_(oldValue, _delegateReplyPolicy_adapt_(oldValue, value))
    _delegateReplyPolicy_inited_ = true
    _delegateReplyPolicy_postSet_(oldValue, _delegateReplyPolicy_)
    if hasListeners(["propertyChange", "delegateReplyPolicy"]) && !FOAM_utils.equals(oldValue, _delegateReplyPolicy_) {
      _ = pub(["propertyChange", "delegateReplyPolicy", delegateReplyPolicy$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.ClientBoxRegistry"

    lazy var label: String = "Client Box Registry"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [DELEGATE,DELEGATE_REPLY_POLICY,DO_LOOKUP,REGISTER,UNREGISTER]

    lazy var cls: AnyClass = ClientBoxRegistry.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return ClientBoxRegistry(args, x)
    }

  }

}