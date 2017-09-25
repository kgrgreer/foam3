// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class SkeletonBox: AbstractFObject, Box {

  public var data: Any? {
    get {
      
if _data_inited_ {
  return _data_
}

return nil

      
    }
set(value) {
      
self.set(key: "data", value: value)
      
    }
  }

  var _data_: Any? = nil

  var _data_inited_: Bool = false

  public static let DATA: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "data"
  let classInfo: ClassInfo
  let transient = false
  let label = "Data" // TODO localize
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

  private lazy var data_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "data",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var data_Value_Sub_: Subscription?

  public var data$: Slot {
    get {
      return self.data_Value_
    }
set(value) {
      
self.data_Value_Sub_?.detach()
self.data_Value_Sub_ = self.data$.linkFrom(value)
self.onDetach(self.data_Value_Sub_!)
      
    }
  }

  lazy var call$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let message = args[0] as! Message?

    
    return self!.`call`(
        _: message)
  }
])
      
  }()

  public static let CALL: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "call"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var send$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let msg = args[0] as! Message

    
    return try self!.`send`(
        _: msg)
  }
])
      
  }()

  public static let SEND: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "send"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `Message_create`(_ args: [String:Any?] = [:]) -> Message {
    
return __subContext__.create(Message.self, args: args)!
      
  }

  public func `RPCMessage_create`(_ args: [String:Any?] = [:]) -> RPCMessage {
    
return __subContext__.create(RPCMessage.self, args: args)!
      
  }

  public func `RPCReturnMessage_create`(_ args: [String:Any?] = [:]) -> RPCReturnMessage {
    
return __subContext__.create(RPCReturnMessage.self, args: args)!
      
  }

  public func `RPCErrorMessage_create`(_ args: [String:Any?] = [:]) -> RPCErrorMessage {
    
return __subContext__.create(RPCErrorMessage.self, args: args)!
      
  }

  public func `InvalidMessageException_create`(_ args: [String:Any?] = [:]) -> InvalidMessageException {
    
return __subContext__.create(InvalidMessageException.self, args: args)!
      
  }

  private func `_data_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_data_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_data_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  public func `call`(_ message: Message?) {
    
do {
  guard let object = message?.object as? RPCMessage,
        let data = self.data as? FObject,
        let method = data.ownClassInfo().axiom(byName: object.name) as? MethodInfo
  else {
    throw InvalidMessageException_create()
  }

  // TODO handle context oriented methods.

  var p = try method.call(data, args: object.args)

  guard let replyBox = message?.attributes["replyBox"] as? Box else { return }
  if let pFut = p as? Future<Any> { p = try pFut.get() }
  try replyBox.send(Message_create([
    "object": RPCReturnMessage_create(["data": p])
  ]))
} catch let e {
  if let errorBox = message?.attributes["errorBox"] as? Box {
    try? errorBox.send(Message_create([
      "object": RPCErrorMessage_create([
        "data": e.localizedDescription
      ])
    ]))
  }
}
      
  }

  public func `send`(_ msg: Message) throws {
    
if let _ = msg.object as? RPCMessage {
  call(msg)
  return
}

throw InvalidMessageException_create([
  "messageType": msg.ownClassInfo().id,
])
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return SkeletonBox.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return SkeletonBox.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "data":
    _data_inited_ = false
    _data_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "data"]) {
      _ = pub(["propertyChange", "data", data$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "data": return `_data_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "data": return `data`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "data": return `data$`


  case "call": return `call$`

  case "send": return `send$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "data$":
    data$ = value as! Slot
    return
  case "data":
  
    let oldValue: Any? = _data_inited_ ? self.`data` : nil
    _data_ = _data_preSet_(oldValue, _data_adapt_(oldValue, value))
    _data_inited_ = true
    _data_postSet_(oldValue, _data_)
    if hasListeners(["propertyChange", "data"]) && !FOAM_utils.equals(oldValue, _data_) {
      _ = pub(["propertyChange", "data", data$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.SkeletonBox"

    lazy var label: String = "Skeleton Box"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [DATA,CALL,SEND]

    lazy var cls: AnyClass = SkeletonBox.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return SkeletonBox(args, x)
    }

  }

}