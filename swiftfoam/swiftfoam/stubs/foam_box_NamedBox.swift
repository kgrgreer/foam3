// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class NamedBox: AbstractFObject, Box {

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

  public var delegate: Box? {
    get {
      
if _delegate_inited_ {
  return _delegate_
}

self.set(key: "delegate", value: _delegate_factory_())
return _delegate_!

      
    }
set(value) {
      
self.set(key: "delegate", value: value)
      
    }
  }

  var _delegate_: Box? = nil

  var _delegate_inited_: Bool = false

  public static let DELEGATE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "delegate"
  let classInfo: ClassInfo
  let transient = true
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

  lazy var getParentBox$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    
    return self!.`getParentBox`(
        )
  }
])
      
  }()

  public static let GET_PARENT_BOX: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "getParentBox"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var getBaseName$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    
    return self!.`getBaseName`(
        )
  }
])
      
  }()

  public static let GET_BASE_NAME: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "getBaseName"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  public func `LookupBox_create`(_ args: [String:Any?] = [:]) -> LookupBox {
    
return __subContext__.create(LookupBox.self, args: args)!
      
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

  private func `_delegate_factory_`() -> Box? {
    
return self.LookupBox_create([
  "name": self.getBaseName(),
  "parentBox": self.getParentBox()
])
      
  }

  private func `_delegate_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Box? {
    return newValue as! Box?
  }

  private func `_delegate_preSet_`(_ oldValue: Any?, _ newValue: Box?) -> Box? {
    return newValue
  }

  private func `_delegate_postSet_`(_ oldValue: Any?, _ newValue: Box?) {
    
  }

  public func `send`(_ msg: Message) throws {
    try delegate!.send(msg)
  }

  public func `getParentBox`() -> Box {
    
var name = ""
if let index = name.range(of: ".", options: .backwards)?.lowerBound {
  name = name.substring(to: index)
}
return ownClassInfo().create(args: [
  "name": name
], x: __subContext__) as! Box
      
  }

  public func `getBaseName`() -> String {
    
if let index = name.range(of: ".", options: .backwards)?.lowerBound {
  return name.substring(to: name.index(index, offsetBy: 1))
}
return ""
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return NamedBox.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return NamedBox.classInfo_
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

  case "name": return `_name_inited_`

  case "delegate": return `_delegate_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "name": return `name`

  case "delegate": return `delegate`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "name": return `name$`

  case "delegate": return `delegate$`


  case "send": return `send$`

  case "getParentBox": return `getParentBox$`

  case "getBaseName": return `getBaseName$`

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
  
    lazy var id: String = "foam.box.NamedBox"

    lazy var label: String = "Named Box"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [NAME,DELEGATE,SEND,GET_PARENT_BOX,GET_BASE_NAME]

    lazy var cls: AnyClass = NamedBox.self

    lazy var multitonMap: [String:FObject] = [:]

    lazy var multitonProperty: PropertyInfo = NAME

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      if let key = args[multitonProperty.name] as? String,
   let value = multitonMap[key] {
  return value
} else {
  let value = NamedBox(args, x)
  if let key = multitonProperty.get(value) as? String {
    multitonMap[key] = value
  }
  return value
}
    }

  }

}