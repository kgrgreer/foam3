// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Message: AbstractFObject {

  public var attributes: [String:Any?] {
    get {
      
if _attributes_inited_ {
  return _attributes_!
}

return [:]

      
    }
set(value) {
      
self.set(key: "attributes", value: value)
      
    }
  }

  var _attributes_: [String:Any?]! = nil

  var _attributes_inited_: Bool = false

  public static let ATTRIBUTES: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "attributes"
  let classInfo: ClassInfo
  let transient = false
  let label = "Attributes" // TODO localize
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

  private lazy var attributes_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "attributes",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var attributes_Value_Sub_: Subscription?

  public var attributes$: Slot {
    get {
      return self.attributes_Value_
    }
set(value) {
      
self.attributes_Value_Sub_?.detach()
self.attributes_Value_Sub_ = self.attributes$.linkFrom(value)
self.onDetach(self.attributes_Value_Sub_!)
      
    }
  }

  public var object: Any? {
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

  var _object_: Any? = nil

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

  public var localAttributes: [String:Any?] {
    get {
      
if _localAttributes_inited_ {
  return _localAttributes_!
}

return [:]

      
    }
set(value) {
      
self.set(key: "localAttributes", value: value)
      
    }
  }

  var _localAttributes_: [String:Any?]! = nil

  var _localAttributes_inited_: Bool = false

  public static let LOCAL_ATTRIBUTES: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "localAttributes"
  let classInfo: ClassInfo
  let transient = true
  let label = "Local Attributes" // TODO localize
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

  private lazy var localAttributes_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "localAttributes",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var localAttributes_Value_Sub_: Subscription?

  public var localAttributes$: Slot {
    get {
      return self.localAttributes_Value_
    }
set(value) {
      
self.localAttributes_Value_Sub_?.detach()
self.localAttributes_Value_Sub_ = self.localAttributes$.linkFrom(value)
self.onDetach(self.localAttributes_Value_Sub_!)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_attributes_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> [String:Any?] {
    return newValue as! [String:Any?]
  }

  private func `_attributes_preSet_`(_ oldValue: Any?, _ newValue: [String:Any?]) -> [String:Any?] {
    return newValue
  }

  private func `_attributes_postSet_`(_ oldValue: Any?, _ newValue: [String:Any?]) {
    
  }

  private func `_object_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_object_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_object_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_localAttributes_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> [String:Any?] {
    return newValue as! [String:Any?]
  }

  private func `_localAttributes_preSet_`(_ oldValue: Any?, _ newValue: [String:Any?]) -> [String:Any?] {
    return newValue
  }

  private func `_localAttributes_postSet_`(_ oldValue: Any?, _ newValue: [String:Any?]) {
    
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Message.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Message.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "attributes":
    _attributes_inited_ = false
    _attributes_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "attributes"]) {
      _ = pub(["propertyChange", "attributes", attributes$])
    }
    break

  case "object":
    _object_inited_ = false
    _object_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "object"]) {
      _ = pub(["propertyChange", "object", object$])
    }
    break

  case "localAttributes":
    _localAttributes_inited_ = false
    _localAttributes_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "localAttributes"]) {
      _ = pub(["propertyChange", "localAttributes", localAttributes$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "attributes": return `_attributes_inited_`

  case "object": return `_object_inited_`

  case "localAttributes": return `_localAttributes_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "attributes": return `attributes`

  case "object": return `object`

  case "localAttributes": return `localAttributes`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "attributes": return `attributes$`

  case "object": return `object$`

  case "localAttributes": return `localAttributes$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "attributes$":
    attributes$ = value as! Slot
    return
  case "attributes":
  
    let oldValue: Any? = _attributes_inited_ ? self.`attributes` : nil
    _attributes_ = _attributes_preSet_(oldValue, _attributes_adapt_(oldValue, value))
    _attributes_inited_ = true
    _attributes_postSet_(oldValue, _attributes_)
    if hasListeners(["propertyChange", "attributes"]) && !FOAM_utils.equals(oldValue, _attributes_) {
      _ = pub(["propertyChange", "attributes", attributes$])
    }
    return

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

  case "localAttributes$":
    localAttributes$ = value as! Slot
    return
  case "localAttributes":
  
    let oldValue: Any? = _localAttributes_inited_ ? self.`localAttributes` : nil
    _localAttributes_ = _localAttributes_preSet_(oldValue, _localAttributes_adapt_(oldValue, value))
    _localAttributes_inited_ = true
    _localAttributes_postSet_(oldValue, _localAttributes_)
    if hasListeners(["propertyChange", "localAttributes"]) && !FOAM_utils.equals(oldValue, _localAttributes_) {
      _ = pub(["propertyChange", "localAttributes", localAttributes$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.Message"

    lazy var label: String = "Message"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [ATTRIBUTES,OBJECT,LOCAL_ATTRIBUTES]

    lazy var cls: AnyClass = Message.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Message(args, x)
    }

  }

}