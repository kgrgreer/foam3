// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class ReplyBox: ProxyBox {

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

  public var id: String {
    get {
      
if _id_inited_ {
  return _id_!
}

self.set(key: "id", value: _id_factory_())
return _id_!

      
    }
set(value) {
      
self.set(key: "id", value: value)
      
    }
  }

  var _id_: String! = nil

  var _id_inited_: Bool = false

  public static let ID: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "id"
  let classInfo: ClassInfo
  let transient = false
  let label = "Id" // TODO localize
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

  private lazy var id_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "id",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var id_Value_Sub_: Subscription?

  public var id$: Slot {
    get {
      return self.id_Value_
    }
set(value) {
      
self.id_Value_Sub_?.detach()
self.id_Value_Sub_ = self.id$.linkFrom(value)
self.onDetach(self.id_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_id_factory_`() -> String {
    return String(FOAM_utils.next$UID())
  }

  private func `_id_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_id_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_id_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  public override func `send`(_ msg: Message) throws {
    
(registry as! BoxRegistry).unregister(id)
try delegate.send(msg)
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return ReplyBox.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return ReplyBox.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "id":
    _id_inited_ = false
    _id_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "id"]) {
      _ = pub(["propertyChange", "id", id$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "id": return `_id_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "id": return `id`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "id": return `id$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "id$":
    id$ = value as! Slot
    return
  case "id":
  
    let oldValue: Any? = _id_inited_ ? self.`id` : nil
    _id_ = _id_preSet_(oldValue, _id_adapt_(oldValue, value))
    _id_inited_ = true
    _id_postSet_(oldValue, _id_)
    if hasListeners(["propertyChange", "id"]) && !FOAM_utils.equals(oldValue, _id_) {
      _ = pub(["propertyChange", "id", id$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.ReplyBox"

    lazy var label: String = "Reply Box"

    lazy var parent: ClassInfo? = ProxyBox.classInfo()

    lazy var ownAxioms: [Axiom] = [ID,SEND]

    lazy var cls: AnyClass = ReplyBox.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return ReplyBox(args, x)
    }

  }

}