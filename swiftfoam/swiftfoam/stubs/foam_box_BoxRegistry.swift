// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class BoxRegistry: AbstractFObject, BoxRegistryInterface {

  public var me: Any? {
    get {
      
return __context__["me"]
      
    }
set(value) {
      
self.me$?.swiftSet(value)
      
    }
  }

  public var me$: Slot? {
    get {
      
return __context__["me$"] as? Slot ?? nil
      
    }
  }

  public var registry_: [String:Any?] {
    get {
      
if _registry__inited_ {
  return _registry__!
}

return [:]

      
    }
set(value) {
      
self.set(key: "registry_", value: value)
      
    }
  }

  var _registry__: [String:Any?]! = nil

  var _registry__inited_: Bool = false

  public static let REGISTRY_: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "registry_"
  let classInfo: ClassInfo
  let transient = false
  let label = "Registry_" // TODO localize
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

  private lazy var registry__Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "registry_",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var registry__Value_Sub_: Subscription?

  public var registry_$: Slot {
    get {
      return self.registry__Value_
    }
set(value) {
      
self.registry__Value_Sub_?.detach()
self.registry__Value_Sub_ = self.registry_$.linkFrom(value)
self.onDetach(self.registry__Value_Sub_!)
      
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

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `NoSuchNameException_create`(_ args: [String:Any?] = [:]) -> NoSuchNameException {
    
return __subContext__.create(NoSuchNameException.self, args: args)!
      
  }

  public func `SubBox_create`(_ args: [String:Any?] = [:]) -> SubBox {
    
return __subContext__.create(SubBox.self, args: args)!
      
  }

  private func `_registry__adapt_`(_ oldValue: Any?, _ newValue: Any?) -> [String:Any?] {
    return newValue as! [String:Any?]
  }

  private func `_registry__preSet_`(_ oldValue: Any?, _ newValue: [String:Any?]) -> [String:Any?] {
    return newValue
  }

  private func `_registry__postSet_`(_ oldValue: Any?, _ newValue: [String:Any?]) {
    
  }

  public func `Registration_create`(_ args: [String:Any?] = [:]) -> Registration {
    
__subContext__.registerClass(cls: Registration.classInfo())
return __subContext__.create(Registration.self, args: args)!
      
  }

  public func `doLookup`(_ name: String) throws -> Box {
    
if let exportBox = (registry_[name] as? Registration)?.exportBox {
  return exportBox
}
throw NoSuchNameException_create(["name": name])
      
  }

  public func `register`(_ name: String, _ service: BoxService?, _ localBox: Box) -> Box {
    
let name: String = name as? String ?? String(FOAM_utils.next$UID())

var exportBox: Box = SubBox_create([
  "name": name,
  "delegate": me
])
exportBox = service?.clientBox(exportBox) ?? exportBox

let registration = Registration_create([
  "exportBox": exportBox,
  "localBox": service?.serverBox(localBox) ?? localBox
])
registry_[name] = registration
return registration.exportBox!
      
  }

  public func `unregister`(_ name: String) {
    
if let name = name as? String {
  registry_.removeValue(forKey: name)
} else if let name = name as? AnyClass {
  for key in registry_.keys {
    if ((registry_[key] as! Registration).exportBox as? AnyClass) === name {
      registry_.removeValue(forKey: key)
      return
    }
  }
}
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return BoxRegistry.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return BoxRegistry.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "registry_":
    _registry__inited_ = false
    _registry__ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "registry_"]) {
      _ = pub(["propertyChange", "registry_", registry_$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "registry_": return `_registry__inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "registry_": return `registry_`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "registry_": return `registry_$`


  case "doLookup": return `doLookup$`

  case "register": return `register$`

  case "unregister": return `unregister$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "registry_$":
    registry_$ = value as! Slot
    return
  case "registry_":
  
    let oldValue: Any? = _registry__inited_ ? self.`registry_` : nil
    _registry__ = _registry__preSet_(oldValue, _registry__adapt_(oldValue, value))
    _registry__inited_ = true
    _registry__postSet_(oldValue, _registry__)
    if hasListeners(["propertyChange", "registry_"]) && !FOAM_utils.equals(oldValue, _registry__) {
      _ = pub(["propertyChange", "registry_", registry_$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  public class Registration: AbstractFObject {
  
    public var exportBox: Box? {
      get {
        
if _exportBox_inited_ {
  return _exportBox_
}

return nil

      
      }
set(value) {
        
self.set(key: "exportBox", value: value)
      
      }
    }

    var _exportBox_: Box? = nil

    var _exportBox_inited_: Bool = false

    public static let EXPORT_BOX: PropertyInfo = {
      
class PInfo: PropertyInfo {
  let name = "exportBox"
  let classInfo: ClassInfo
  let transient = false
  let label = "Export Box" // TODO localize
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

    private lazy var exportBox_Value_: PropertySlot = {
      
let s = PropertySlot([
  "object": self,
  "propertyName": "exportBox",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
    }()

    private(set) public var exportBox_Value_Sub_: Subscription?

    public var exportBox$: Slot {
      get {
        return self.exportBox_Value_
      }
set(value) {
        
self.exportBox_Value_Sub_?.detach()
self.exportBox_Value_Sub_ = self.exportBox$.linkFrom(value)
self.onDetach(self.exportBox_Value_Sub_!)
      
      }
    }

    public var localBox: Box {
      get {
        
if _localBox_inited_ {
  return _localBox_!
}

fatalError("No default value for localBox")

      
      }
set(value) {
        
self.set(key: "localBox", value: value)
      
      }
    }

    var _localBox_: Box! = nil

    var _localBox_inited_: Bool = false

    public static let LOCAL_BOX: PropertyInfo = {
      
class PInfo: PropertyInfo {
  let name = "localBox"
  let classInfo: ClassInfo
  let transient = false
  let label = "Local Box" // TODO localize
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

    private lazy var localBox_Value_: PropertySlot = {
      
let s = PropertySlot([
  "object": self,
  "propertyName": "localBox",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
    }()

    private(set) public var localBox_Value_Sub_: Subscription?

    public var localBox$: Slot {
      get {
        return self.localBox_Value_
      }
set(value) {
        
self.localBox_Value_Sub_?.detach()
self.localBox_Value_Sub_ = self.localBox$.linkFrom(value)
self.onDetach(self.localBox_Value_Sub_!)
      
      }
    }

    private static var classInfo_: ClassInfo = ClassInfo_()

    private func `_exportBox_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Box? {
      return newValue as! Box?
    }

    private func `_exportBox_preSet_`(_ oldValue: Any?, _ newValue: Box?) -> Box? {
      return newValue
    }

    private func `_exportBox_postSet_`(_ oldValue: Any?, _ newValue: Box?) {
      
    }

    private func `_localBox_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Box {
      return newValue as! Box
    }

    private func `_localBox_preSet_`(_ oldValue: Any?, _ newValue: Box) -> Box {
      return newValue
    }

    private func `_localBox_postSet_`(_ oldValue: Any?, _ newValue: Box) {
      
    }

    public override func `ownClassInfo`() -> ClassInfo {
      return Registration.classInfo_
    }

    public override class func `classInfo`() -> ClassInfo {
      return Registration.classInfo_
    }

    public override func `clearProperty`(_ key: String) {
      switch key {

  case "exportBox":
    _exportBox_inited_ = false
    _exportBox_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "exportBox"]) {
      _ = pub(["propertyChange", "exportBox", exportBox$])
    }
    break

  case "localBox":
    _localBox_inited_ = false
    _localBox_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "localBox"]) {
      _ = pub(["propertyChange", "localBox", localBox$])
    }
    break

  default:
    super.clearProperty(key)
}
    }

    public override func `hasOwnProperty`(_ key: String) -> Bool {
      switch key {

  case "exportBox": return `_exportBox_inited_`

  case "localBox": return `_localBox_inited_`

  default:
    return super.hasOwnProperty(key)
}
    }

    public override func `get`(key: String) -> Any? {
      switch key {

  case "exportBox": return `exportBox`

  case "localBox": return `localBox`

  default:
    return super.get(key: key)
}
    }

    public override func `getSlot`(key: String) -> Slot? {
      switch key {

  case "exportBox": return `exportBox$`

  case "localBox": return `localBox$`


  default:
    return super.getSlot(key: key)
}
    }

    public override func `set`(key: String, value: Any?) {
      switch key {

  case "exportBox$":
    exportBox$ = value as! Slot
    return
  case "exportBox":
  
    let oldValue: Any? = _exportBox_inited_ ? self.`exportBox` : nil
    _exportBox_ = _exportBox_preSet_(oldValue, _exportBox_adapt_(oldValue, value))
    _exportBox_inited_ = true
    _exportBox_postSet_(oldValue, _exportBox_)
    if hasListeners(["propertyChange", "exportBox"]) && !FOAM_utils.equals(oldValue, _exportBox_) {
      _ = pub(["propertyChange", "exportBox", exportBox$])
    }
    return

  case "localBox$":
    localBox$ = value as! Slot
    return
  case "localBox":
  
    let oldValue: Any? = _localBox_inited_ ? self.`localBox` : nil
    _localBox_ = _localBox_preSet_(oldValue, _localBox_adapt_(oldValue, value))
    _localBox_inited_ = true
    _localBox_postSet_(oldValue, _localBox_)
    if hasListeners(["propertyChange", "localBox"]) && !FOAM_utils.equals(oldValue, _localBox_) {
      _ = pub(["propertyChange", "localBox", localBox$])
    }
    return

  default: break
}
super.set(key: key, value: value)
    }

    // GENERATED CODE. DO NOT MODIFY BY HAND.
    private class ClassInfo_: ClassInfo {
    
      lazy var id: String = "Registration"

      lazy var label: String = "Registration"

      lazy var parent: ClassInfo? = nil

      lazy var ownAxioms: [Axiom] = [EXPORT_BOX,LOCAL_BOX]

      lazy var cls: AnyClass = Registration.self

      func `create`(args: [String:Any?] = [:], x: Context) -> Any {
        return Registration(args, x)
      }

    }

  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.BoxRegistry"

    lazy var label: String = "Box Registry"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [REGISTRY_,DO_LOOKUP,REGISTER,UNREGISTER]

    lazy var cls: AnyClass = BoxRegistry.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return BoxRegistry(args, x)
    }

  }

}