// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class SubSlot: Slot {

  public var parentSlot: Slot {
    get {
      
if _parentSlot_inited_ {
  return _parentSlot_!
}

fatalError("No default value for parentSlot")

      
    }
set(value) {
      
self.set(key: "parentSlot", value: value)
      
    }
  }

  weak var _parentSlot_: Slot! = nil

  var _parentSlot_inited_: Bool = false

  public static let PARENT_SLOT: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "parentSlot"
  let classInfo: ClassInfo
  let transient = false
  let label = "Parent Slot" // TODO localize
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

  private lazy var parentSlot_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "parentSlot",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var parentSlot_Value_Sub_: Subscription?

  public var parentSlot$: Slot {
    get {
      return self.parentSlot_Value_
    }
set(value) {
      
self.parentSlot_Value_Sub_?.detach()
self.parentSlot_Value_Sub_ = self.parentSlot$.linkFrom(value)
self.onDetach(self.parentSlot_Value_Sub_!)
      
    }
  }

  public var name: String {
    get {
      
if _name_inited_ {
  return _name_!
}

return ""

      
    }
set(value) {
      
self.set(key: "name", value: value)
      
    }
  }

  var _name_: String! = nil

  var _name_inited_: Bool = false

  public static let NAME: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "name"
  let classInfo: ClassInfo
  let transient = false
  let label = "Name" // TODO localize
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

  private lazy var name_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "name",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var name_Value_Sub_: Subscription?

  public var name$: Slot {
    get {
      return self.name_Value_
    }
set(value) {
      
self.name_Value_Sub_?.detach()
self.name_Value_Sub_ = self.name$.linkFrom(value)
self.onDetach(self.name_Value_Sub_!)
      
    }
  }

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

  public var prevSub: Subscription? {
    get {
      
if _prevSub_inited_ {
  return _prevSub_
}

return nil

      
    }
set(value) {
      
self.set(key: "prevSub", value: value)
      
    }
  }

  var _prevSub_: Subscription? = nil

  var _prevSub_inited_: Bool = false

  public static let PREV_SUB: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "prevSub"
  let classInfo: ClassInfo
  let transient = false
  let label = "Prev Sub" // TODO localize
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

  private lazy var prevSub_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "prevSub",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var prevSub_Value_Sub_: Subscription?

  public var prevSub$: Slot {
    get {
      return self.prevSub_Value_
    }
set(value) {
      
self.prevSub_Value_Sub_?.detach()
self.prevSub_Value_Sub_ = self.prevSub$.linkFrom(value)
self.onDetach(self.prevSub_Value_Sub_!)
      
    }
  }

  lazy var __foamInit__$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    
    return self!.`__foamInit__`(
        )
  }
])
      
  }()

  public static let __FOAM_INIT__: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "__foamInit__"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var parentChange_listener: Listener = {
    


return { [weak self] sub, args in
  self?.parentChange_method(sub, args)
} as (Subscription, [Any?]) -> Void


      
  }()

  public static let PARENT_CHANGE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "parentChange"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var valueChange_listener: Listener = {
    


return { [weak self] sub, args in
  self?.valueChange_method(sub, args)
} as (Subscription, [Any?]) -> Void


      
  }()

  public static let VALUE_CHANGE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "valueChange"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_parentSlot_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Slot {
    return newValue as! Slot
  }

  private func `_parentSlot_preSet_`(_ oldValue: Any?, _ newValue: Slot) -> Slot {
    return newValue
  }

  private func `_parentSlot_postSet_`(_ oldValue: Any?, _ newValue: Slot) {
    
  }

  private func `_name_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_name_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_name_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  private func `_value_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_value_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_value_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_prevSub_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Subscription? {
    return newValue as! Subscription?
  }

  private func `_prevSub_preSet_`(_ oldValue: Any?, _ newValue: Subscription?) -> Subscription? {
    return newValue
  }

  private func `_prevSub_postSet_`(_ oldValue: Any?, _ newValue: Subscription?) {
    
  }

  public override func `__foamInit__`() {
    
onDetach(parentSlot.swiftSub(parentChange_listener))
onDetach(Subscription(detach: { self.value = nil }))
parentChange()
      
  }

  public override func `swiftGet`() -> Any? {
    
if let o = parentSlot.swiftGet() as? FObject { return o.get(key: name) }
return nil
      
  }

  public override func `swiftSet`(_ value: Any?) {
    
if let o = parentSlot.swiftGet() as? FObject { o.set(key: name, value: value) }
      
  }

  public override func `swiftSub`(_ listener: @escaping Listener) -> Subscription {
    
return sub(topics: ["propertyChange", "value"], listener: listener)
      
  }

  func `parentChange`() {
    parentChange_listener(Subscription(detach: {}), [])
  }

  private func `parentChange_method`(_ sub: Subscription, _ args: [Any?]) {
    
prevSub?.detach()
prevSub = nil
if let o = parentSlot.swiftGet() as? FObject {
  prevSub = o.getSlot(key: name)?.swiftSub(valueChange_listener)
  onDetach(prevSub!)
}
valueChange()
      
  }

  func `valueChange`() {
    valueChange_listener(Subscription(detach: {}), [])
  }

  private func `valueChange_method`(_ sub: Subscription, _ args: [Any?]) {
    
if let parentValue = parentSlot.swiftGet() as? FObject {
  value = parentValue.get(key: name)
} else {
  value = nil
}
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return SubSlot.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return SubSlot.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "parentSlot":
    _parentSlot_inited_ = false
    _parentSlot_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "parentSlot"]) {
      _ = pub(["propertyChange", "parentSlot", parentSlot$])
    }
    break

  case "name":
    _name_inited_ = false
    _name_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "name"]) {
      _ = pub(["propertyChange", "name", name$])
    }
    break

  case "value":
    _value_inited_ = false
    _value_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "value"]) {
      _ = pub(["propertyChange", "value", value$])
    }
    break

  case "prevSub":
    _prevSub_inited_ = false
    _prevSub_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "prevSub"]) {
      _ = pub(["propertyChange", "prevSub", prevSub$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "parentSlot": return `_parentSlot_inited_`

  case "name": return `_name_inited_`

  case "value": return `_value_inited_`

  case "prevSub": return `_prevSub_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "parentSlot": return `parentSlot`

  case "name": return `name`

  case "value": return `value`

  case "prevSub": return `prevSub`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "parentSlot": return `parentSlot$`

  case "name": return `name$`

  case "value": return `value$`

  case "prevSub": return `prevSub$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "parentSlot$":
    parentSlot$ = value as! Slot
    return
  case "parentSlot":
  
    let oldValue: Any? = _parentSlot_inited_ ? self.`parentSlot` : nil
    _parentSlot_ = _parentSlot_preSet_(oldValue, _parentSlot_adapt_(oldValue, value))
    _parentSlot_inited_ = true
    _parentSlot_postSet_(oldValue, _parentSlot_)
    if hasListeners(["propertyChange", "parentSlot"]) && !FOAM_utils.equals(oldValue, _parentSlot_) {
      _ = pub(["propertyChange", "parentSlot", parentSlot$])
    }
    return

  case "name$":
    name$ = value as! Slot
    return
  case "name":
  
    let oldValue: Any? = _name_inited_ ? self.`name` : nil
    _name_ = _name_preSet_(oldValue, _name_adapt_(oldValue, value))
    _name_inited_ = true
    _name_postSet_(oldValue, _name_)
    if hasListeners(["propertyChange", "name"]) && !FOAM_utils.equals(oldValue, _name_) {
      _ = pub(["propertyChange", "name", name$])
    }
    return

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

  case "prevSub$":
    prevSub$ = value as! Slot
    return
  case "prevSub":
  
    let oldValue: Any? = _prevSub_inited_ ? self.`prevSub` : nil
    _prevSub_ = _prevSub_preSet_(oldValue, _prevSub_adapt_(oldValue, value))
    _prevSub_inited_ = true
    _prevSub_postSet_(oldValue, _prevSub_)
    if hasListeners(["propertyChange", "prevSub"]) && !FOAM_utils.equals(oldValue, _prevSub_) {
      _ = pub(["propertyChange", "prevSub", prevSub$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.core.SubSlot"

    lazy var label: String = "Sub Slot"

    lazy var parent: ClassInfo? = Slot.classInfo()

    lazy var ownAxioms: [Axiom] = [PARENT_SLOT,NAME,VALUE,PREV_SUB,__FOAM_INIT__,SWIFT_GET,SWIFT_SET,SWIFT_SUB,PARENT_CHANGE,VALUE_CHANGE]

    lazy var cls: AnyClass = SubSlot.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return SubSlot(args, x)
    }

  }

}