// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class PropertySlot: Slot {

  public var object: FObject! {
    get {
      
if _object_inited_ {
  return _object_
}

return nil

      
    }
set(value) {
      
self.set(key: "object", value: value)
      
    }
  }

  weak var _object_: FObject! = nil

  var _object_inited_: Bool = false

  public static let OBJECT: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "object"
  let classInfo: ClassInfo
  let transient = false
  let label = "Object" // TODO localize
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

  private lazy var object_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "object",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var object_Value_Sub_: Subscription?

  public var object$: Slot {
    get {
      return self.object_Value_
    }
set(value) {
      
self.object_Value_Sub_?.detach()
self.object_Value_Sub_ = self.object$.linkFrom(value)
self.onDetach(self.object_Value_Sub_!)
      
    }
  }

  public var propertyName: String {
    get {
      
if _propertyName_inited_ {
  return _propertyName_!
}

return ""

      
    }
set(value) {
      
self.set(key: "propertyName", value: value)
      
    }
  }

  var _propertyName_: String! = nil

  var _propertyName_inited_: Bool = false

  public static let PROPERTY_NAME: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "propertyName"
  let classInfo: ClassInfo
  let transient = false
  let label = "Property Name" // TODO localize
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

  private lazy var propertyName_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "propertyName",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var propertyName_Value_Sub_: Subscription?

  public var propertyName$: Slot {
    get {
      return self.propertyName_Value_
    }
set(value) {
      
self.propertyName_Value_Sub_?.detach()
self.propertyName_Value_Sub_ = self.propertyName$.linkFrom(value)
self.onDetach(self.propertyName_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_object_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> FObject! {
    return newValue as! FObject!
  }

  private func `_object_preSet_`(_ oldValue: Any?, _ newValue: FObject!) -> FObject! {
    return newValue
  }

  private func `_object_postSet_`(_ oldValue: Any?, _ newValue: FObject!) {
    
  }

  private func `_propertyName_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_propertyName_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_propertyName_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  public override func `swiftGet`() -> Any? {
    
return object.get(key: propertyName)
      
  }

  public override func `swiftSet`(_ value: Any?) {
    
object.set(key: propertyName, value: value)
      
  }

  public override func `swiftSub`(_ listener: @escaping Listener) -> Subscription {
    
return object.sub(topics: ["propertyChange", propertyName], listener: listener)
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return PropertySlot.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return PropertySlot.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "object":
    _object_inited_ = false
    _object_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "object"]) {
      _ = pub(["propertyChange", "object", object$])
    }
    break

  case "propertyName":
    _propertyName_inited_ = false
    _propertyName_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "propertyName"]) {
      _ = pub(["propertyChange", "propertyName", propertyName$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "object": return `_object_inited_`

  case "propertyName": return `_propertyName_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "object": return `object`

  case "propertyName": return `propertyName`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "object": return `object$`

  case "propertyName": return `propertyName$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "object$":
    object$ = value as! Slot
    return
  case "object":
  
    let oldValue: Any? = _object_inited_ ? self.`object` : nil
    _object_ = _object_preSet_(oldValue, _object_adapt_(oldValue, value))
    _object_inited_ = true
    _object_postSet_(oldValue, _object_)
    if hasListeners(["propertyChange", "object"]) && !FOAM_utils.equals(oldValue, _object_) {
      _ = pub(["propertyChange", "object", object$])
    }
    return

  case "propertyName$":
    propertyName$ = value as! Slot
    return
  case "propertyName":
  
    let oldValue: Any? = _propertyName_inited_ ? self.`propertyName` : nil
    _propertyName_ = _propertyName_preSet_(oldValue, _propertyName_adapt_(oldValue, value))
    _propertyName_inited_ = true
    _propertyName_postSet_(oldValue, _propertyName_)
    if hasListeners(["propertyChange", "propertyName"]) && !FOAM_utils.equals(oldValue, _propertyName_) {
      _ = pub(["propertyChange", "propertyName", propertyName$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.core.PropertySlot"

    lazy var label: String = "Property Slot"

    lazy var parent: ClassInfo? = Slot.classInfo()

    lazy var ownAxioms: [Axiom] = [OBJECT,PROPERTY_NAME,SWIFT_GET,SWIFT_SET,SWIFT_SUB]

    lazy var cls: AnyClass = PropertySlot.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return PropertySlot(args, x)
    }

  }

}