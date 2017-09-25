// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class RPCReturnBox: AbstractFObject, Box {

  public var future: Future<Any?> {
    get {
      
if _future_inited_ {
  return _future_!
}

self.set(key: "future", value: _future_factory_())
return _future_!

      
    }
set(value) {
      
self.set(key: "future", value: value)
      
    }
  }

  var _future_: Future<Any?>! = nil

  var _future_inited_: Bool = false

  public static let FUTURE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "future"
  let classInfo: ClassInfo
  let transient = false
  let label = "Future" // TODO localize
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

  private lazy var future_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "future",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var future_Value_Sub_: Subscription?

  public var future$: Slot {
    get {
      return self.future_Value_
    }
set(value) {
      
self.future_Value_Sub_?.detach()
self.future_Value_Sub_ = self.future$.linkFrom(value)
self.onDetach(self.future_Value_Sub_!)
      
    }
  }

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

  public func `RPCReturnMessage_create`(_ args: [String:Any?] = [:]) -> RPCReturnMessage {
    
return __subContext__.create(RPCReturnMessage.self, args: args)!
      
  }

  private func `_future_factory_`() -> Future<Any?> {
    return Future()
  }

  private func `_future_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Future<Any?> {
    return newValue as! Future<Any?>
  }

  private func `_future_preSet_`(_ oldValue: Any?, _ newValue: Future<Any?>) -> Future<Any?> {
    return newValue
  }

  private func `_future_postSet_`(_ oldValue: Any?, _ newValue: Future<Any?>) {
    
  }

  public func `send`(_ msg: Message) throws {
    
if let o = msg.object as? RPCReturnMessage {
  future.set(o.data)
  return
}
future.error(FoamError(msg.object))
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return RPCReturnBox.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return RPCReturnBox.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "future":
    _future_inited_ = false
    _future_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "future"]) {
      _ = pub(["propertyChange", "future", future$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "future": return `_future_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "future": return `future`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "future": return `future$`


  case "send": return `send$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "future$":
    future$ = value as! Slot
    return
  case "future":
  
    let oldValue: Any? = _future_inited_ ? self.`future` : nil
    _future_ = _future_preSet_(oldValue, _future_adapt_(oldValue, value))
    _future_inited_ = true
    _future_postSet_(oldValue, _future_)
    if hasListeners(["propertyChange", "future"]) && !FOAM_utils.equals(oldValue, _future_) {
      _ = pub(["propertyChange", "future", future$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.box.RPCReturnBox"

    lazy var label: String = "RPCReturn Box"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [FUTURE,SEND]

    lazy var cls: AnyClass = RPCReturnBox.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return RPCReturnBox(args, x)
    }

  }

}