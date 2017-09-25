// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class ConstantSlot: Slot {

  public var value: Any? {
    get {
      
if _value_inited_ {
  return _value_
}

return nil

      
    }
set(value) {
      
self.set(key: "value", value: value)
      
    }
  }

  var _value_: Any? = nil

  var _value_inited_: Bool = false

  public static let VALUE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "value"
  let classInfo: ClassInfo
  let transient = false
  let label = "Value" // TODO localize
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

  private lazy var value_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "value",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var value_Value_Sub_: Subscription?

  public var value$: Slot {
    get {
      return self.value_Value_
    }
set(value) {
      
self.value_Value_Sub_?.detach()
self.value_Value_Sub_ = self.value$.linkFrom(value)
self.onDetach(self.value_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_value_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_value_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_value_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  public override func `swiftGet`() -> Any? {
    
return value
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return ConstantSlot.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return ConstantSlot.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "value":
    _value_inited_ = false
    _value_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "value"]) {
      _ = pub(["propertyChange", "value", value$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "value": return `_value_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "value": return `value`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "value": return `value$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "value$":
    value$ = value as! Slot
    return
  case "value":
  
    let oldValue: Any? = _value_inited_ ? self.`value` : nil
    _value_ = _value_preSet_(oldValue, _value_adapt_(oldValue, value))
    _value_inited_ = true
    _value_postSet_(oldValue, _value_)
    if hasListeners(["propertyChange", "value"]) && !FOAM_utils.equals(oldValue, _value_) {
      _ = pub(["propertyChange", "value", value$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.core.ConstantSlot"

    lazy var label: String = "Constant Slot"

    lazy var parent: ClassInfo? = Slot.classInfo()

    lazy var ownAxioms: [Axiom] = [VALUE,SWIFT_GET]

    lazy var cls: AnyClass = ConstantSlot.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return ConstantSlot(args, x)
    }

  }

}