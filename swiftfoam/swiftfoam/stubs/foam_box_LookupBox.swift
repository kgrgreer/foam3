// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class LookupBox: ProxyBox {

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

  public var parentBox: Any? {
    get {
      
if _parentBox_inited_ {
  return _parentBox_
}

return nil

      
    }
set(value) {
      
self.set(key: "parentBox", value: value)
      
    }
  }

  var _parentBox_: Any? = nil

  var _parentBox_inited_: Bool = false

  public static let PARENT_BOX: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "parentBox"
  let classInfo: ClassInfo
  let transient = false
  let label = "Parent Box" // TODO localize
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

  private lazy var parentBox_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "parentBox",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var parentBox_Value_Sub_: Subscription?

  public var parentBox$: Slot {
    get {
      return self.parentBox_Value_
    }
set(value) {
      
self.parentBox_Value_Sub_?.detach()
self.parentBox_Value_Sub_ = self.parentBox$.linkFrom(value)
self.onDetach(self.parentBox_Value_Sub_!)
      
    }
  }

  public var registry: BoxRegistryInterface? {
    get {
      
if _registry_inited_ {
  return _registry_
}

self.set(key: "registry", value: _registry_factory_())
return _registry_!

      
    }
set(value) {
      
self.set(key: "registry", value: value)
      
    }
  }

  var _registry_: BoxRegistryInterface? = nil

  var _registry_inited_: Bool = false

  public static let REGISTRY: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "registry"
  let classInfo: ClassInfo
  let transient = true
  let label = "Registry" // TODO localize
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

  private lazy var registry_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "registry",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var registry_Value_Sub_: Subscription?

  public var registry$: Slot {
    get {
      return self.registry_Value_
    }
set(value) {
      
self.registry_Value_Sub_?.detach()
self.registry_Value_Sub_ = self.registry$.linkFrom(value)
self.onDetach(self.registry_Value_Sub_!)
      
    }
  }

  override public var delegate: Box {
    get {
      
if _delegate_inited_ {
  return _delegate_!
}

self.set(key: "delegate", value: _delegate_factory_())
return _delegate_!

      
    }
set(value) {
      
self.set(key: "delegate", value: value)
      
    }
  }

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `ClientBoxRegistry_create`(_ args: [String:Any?] = [:]) -> ClientBoxRegistry {
    
return __subContext__.create(ClientBoxRegistry.self, args: args)!
      
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

  private func `_parentBox_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_parentBox_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_parentBox_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_registry_factory_`() -> BoxRegistryInterface? {
    
return ClientBoxRegistry_create([
  "delegate": parentBox
])
      
  }

  private func `_registry_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> BoxRegistryInterface? {
    return newValue as! BoxRegistryInterface?
  }

  private func `_registry_preSet_`(_ oldValue: Any?, _ newValue: BoxRegistryInterface?) -> BoxRegistryInterface? {
    return newValue
  }

  private func `_registry_postSet_`(_ oldValue: Any?, _ newValue: BoxRegistryInterface?) {
    
  }

  private func `_delegate_factory_`() -> Box {
    return try! registry!.doLookup(name)
  }

  private func `_delegate_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Box {
    return newValue as! Box
  }

  private func `_delegate_preSet_`(_ oldValue: Any?, _ newValue: Box) -> Box {
    return newValue
  }

  private func `_delegate_postSet_`(_ oldValue: Any?, _ newValue: Box) {
    
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return LookupBox.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return LookupBox.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "name":
    _name_inited_ = false
    _name_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "name"]) {
      _ = pub(["propertyChange", "name", name$])
    }
    break

  case "parentBox":
    _parentBox_inited_ = false
    _parentBox_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "parentBox"]) {
      _ = pub(["propertyChange", "parentBox", parentBox$])
    }
    break

  case "registry":
    _registry_inited_ = false
    _registry_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "registry"]) {
      _ = pub(["propertyChange", "registry", registry$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "name": return `_name_inited_`

  case "parentBox": return `_parentBox_inited_`

  case "registry": return `_registry_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "name": return `name`

  case "parentBox": return `parentBox`

  case "registry": return `registry`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "name": return `name$`

  case "parentBox": return `parentBox$`

  case "registry": return `registry$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

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

  case "parentBox$":
    parentBox$ = value as! Slot
    return
  case "parentBox":
  
    let oldValue: Any? = _parentBox_inited_ ? self.`parentBox` : nil
    _parentBox_ = _parentBox_preSet_(oldValue, _parentBox_adapt_(oldValue, value))
    _parentBox_inited_ = true
    _parentBox_postSet_(oldValue, _parentBox_)
    if hasListeners(["propertyChange", "parentBox"]) && !FOAM_utils.equals(oldValue, _parentBox_) {
      _ = pub(["propertyChange", "parentBox", parentBox$])
    }
    return

  case "registry$":
    registry$ = value as! Slot
    return
  case "registry":
  
    let oldValue: Any? = _registry_inited_ ? self.`registry` : nil
    _registry_ = _registry_preSet_(oldValue, _registry_adapt_(oldValue, value))
    _registry_inited_ = true
    _registry_postSet_(oldValue, _registry_)
    if hasListeners(["propertyChange", "registry"]) && !FOAM_utils.equals(oldValue, _registry_) {
      _ = pub(["propertyChange", "registry", registry$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.LookupBox"

    lazy var label: String = "Lookup Box"

    lazy var parent: ClassInfo? = ProxyBox.classInfo()

    lazy var ownAxioms: [Axiom] = [NAME,PARENT_BOX,REGISTRY,DELEGATE]

    lazy var cls: AnyClass = LookupBox.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return LookupBox(args, x)
    }

  }

}