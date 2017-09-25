// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class ProxyBox: AbstractFObject, Box {

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

  private func `_delegate_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Box {
    return newValue as! Box
  }

  private func `_delegate_preSet_`(_ oldValue: Any?, _ newValue: Box) -> Box {
    return newValue
  }

  private func `_delegate_postSet_`(_ oldValue: Any?, _ newValue: Box) {
    
  }

  public func `send`(_ msg: Message) throws {
    try delegate.send(msg)
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return ProxyBox.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return ProxyBox.classInfo_
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

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "delegate": return `_delegate_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "delegate": return `delegate`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "delegate": return `delegate$`


  case "send": return `send$`

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

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.ProxyBox"

    lazy var label: String = "Proxy Box"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [DELEGATE,SEND]

    lazy var cls: AnyClass = ProxyBox.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return ProxyBox(args, x)
    }

  }

}