// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class ClassWhitelistContext: AbstractFObject {

  public var whitelist: Any? {
    get {
      
if _whitelist_inited_ {
  return _whitelist_
}

return nil

      
    }
set(value) {
      
self.set(key: "whitelist", value: value)
      
    }
  }

  var _whitelist_: Any? = nil

  var _whitelist_inited_: Bool = false

  public static let WHITELIST: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "whitelist"
  let classInfo: ClassInfo
  let transient = false
  let label = "Whitelist" // TODO localize
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

  private lazy var whitelist_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "whitelist",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var whitelist_Value_Sub_: Subscription?

  public var whitelist$: Slot {
    get {
      return self.whitelist_Value_
    }
set(value) {
      
self.whitelist_Value_Sub_?.detach()
self.whitelist_Value_Sub_ = self.whitelist$.linkFrom(value)
self.onDetach(self.whitelist_Value_Sub_!)
      
    }
  }

  public var whitelist_: Any? {
    get {
      
if _whitelist__inited_ {
  return _whitelist__
}

return nil

      
    }
set(value) {
      
self.set(key: "whitelist_", value: value)
      
    }
  }

  var _whitelist__: Any? = nil

  var _whitelist__inited_: Bool = false

  public static let WHITELIST_: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "whitelist_"
  let classInfo: ClassInfo
  let transient = false
  let label = "Whitelist_" // TODO localize
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

  private lazy var whitelist__Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "whitelist_",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var whitelist__Value_Sub_: Subscription?

  public var whitelist_$: Slot {
    get {
      return self.whitelist__Value_
    }
set(value) {
      
self.whitelist__Value_Sub_?.detach()
self.whitelist__Value_Sub_ = self.whitelist_$.linkFrom(value)
self.onDetach(self.whitelist__Value_Sub_!)
      
    }
  }

  lazy var lookup$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    
    return self!.`lookup`(
        )
  }
])
      
  }()

  public static let LOOKUP: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "lookup"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_whitelist_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_whitelist_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_whitelist_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_whitelist__adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_whitelist__preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_whitelist__postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  public func `lookup`() {
    fatalError()
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return ClassWhitelistContext.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return ClassWhitelistContext.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "whitelist":
    _whitelist_inited_ = false
    _whitelist_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "whitelist"]) {
      _ = pub(["propertyChange", "whitelist", whitelist$])
    }
    break

  case "whitelist_":
    _whitelist__inited_ = false
    _whitelist__ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "whitelist_"]) {
      _ = pub(["propertyChange", "whitelist_", whitelist_$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "whitelist": return `_whitelist_inited_`

  case "whitelist_": return `_whitelist__inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "whitelist": return `whitelist`

  case "whitelist_": return `whitelist_`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "whitelist": return `whitelist$`

  case "whitelist_": return `whitelist_$`


  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "whitelist$":
    whitelist$ = value as! Slot
    return
  case "whitelist":
  
    let oldValue: Any? = _whitelist_inited_ ? self.`whitelist` : nil
    _whitelist_ = _whitelist_preSet_(oldValue, _whitelist_adapt_(oldValue, value))
    _whitelist_inited_ = true
    _whitelist_postSet_(oldValue, _whitelist_)
    if hasListeners(["propertyChange", "whitelist"]) && !FOAM_utils.equals(oldValue, _whitelist_) {
      _ = pub(["propertyChange", "whitelist", whitelist$])
    }
    return

  case "whitelist_$":
    whitelist_$ = value as! Slot
    return
  case "whitelist_":
  
    let oldValue: Any? = _whitelist__inited_ ? self.`whitelist_` : nil
    _whitelist__ = _whitelist__preSet_(oldValue, _whitelist__adapt_(oldValue, value))
    _whitelist__inited_ = true
    _whitelist__postSet_(oldValue, _whitelist__)
    if hasListeners(["propertyChange", "whitelist_"]) && !FOAM_utils.equals(oldValue, _whitelist__) {
      _ = pub(["propertyChange", "whitelist_", whitelist_$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  override func `_createExports_`() -> [String:Any?] {
    var args = super._createExports_()

args["lookup"] = lookup$

return args
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.box.ClassWhitelistContext"

    lazy var label: String = "Class Whitelist Context"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [WHITELIST,WHITELIST_,LOOKUP]

    lazy var cls: AnyClass = ClassWhitelistContext.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return ClassWhitelistContext(args, x)
    }

  }

}