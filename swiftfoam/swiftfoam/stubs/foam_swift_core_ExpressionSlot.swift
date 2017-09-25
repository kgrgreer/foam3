// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class ExpressionSlot: Slot {

  public var args: [Slot] {
    get {
      
if _args_inited_ {
  return _args_!
}

fatalError("No default value for args")

      
    }
set(value) {
      
self.set(key: "args", value: value)
      
    }
  }

  var _args_: [Slot]! = nil

  var _args_inited_: Bool = false

  public static let ARGS: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "args"
  let classInfo: ClassInfo
  let transient = false
  let label = "Args" // TODO localize
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

  private lazy var args_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "args",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var args_Value_Sub_: Subscription?

  public var args$: Slot {
    get {
      return self.args_Value_
    }
set(value) {
      
self.args_Value_Sub_?.detach()
self.args_Value_Sub_ = self.args$.linkFrom(value)
self.onDetach(self.args_Value_Sub_!)
      
    }
  }

  public var code: (([Any?]) -> Any?) {
    get {
      
if _code_inited_ {
  return _code_!
}

fatalError("No default value for code")

      
    }
set(value) {
      
self.set(key: "code", value: value)
      
    }
  }

  var _code_: (([Any?]) -> Any?)! = nil

  var _code_inited_: Bool = false

  public static let CODE: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "code"
  let classInfo: ClassInfo
  let transient = false
  let label = "Code" // TODO localize
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

  private lazy var code_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "code",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var code_Value_Sub_: Subscription?

  public var code$: Slot {
    get {
      return self.code_Value_
    }
set(value) {
      
self.code_Value_Sub_?.detach()
self.code_Value_Sub_ = self.code$.linkFrom(value)
self.onDetach(self.code_Value_Sub_!)
      
    }
  }

  public var value: Any? {
    get {
      
if _value_inited_ {
  return _value_
}

self.set(key: "value", value: _value_factory_())
return _value_

      
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

  public var cleanup_: Subscription? {
    get {
      
if _cleanup__inited_ {
  return _cleanup__
}

return nil

      
    }
set(value) {
      
self.set(key: "cleanup_", value: value)
      
    }
  }

  var _cleanup__: Subscription? = nil

  var _cleanup__inited_: Bool = false

  public static let CLEANUP_: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "cleanup_"
  let classInfo: ClassInfo
  let transient = false
  let label = "Cleanup_" // TODO localize
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

  private lazy var cleanup__Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "cleanup_",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var cleanup__Value_Sub_: Subscription?

  public var cleanup_$: Slot {
    get {
      return self.cleanup__Value_
    }
set(value) {
      
self.cleanup__Value_Sub_?.detach()
self.cleanup__Value_Sub_ = self.cleanup_$.linkFrom(value)
self.onDetach(self.cleanup__Value_Sub_!)
      
    }
  }

  lazy var subToArgs_$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let slots = args[0] as! [Slot]

    
    return self!.`subToArgs_`(
        _: slots)
  }
])
      
  }()

  public static let SUB_TO_ARGS_: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "subToArgs_"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var cleanup_listener: Listener = {
    


return { [weak self] sub, args in
  self?.cleanup_method(sub, args)
} as (Subscription, [Any?]) -> Void


      
  }()

  public static let CLEANUP: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "cleanup"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var invalidate_listener: Listener = {
    


return { [weak self] sub, args in
  self?.invalidate_method(sub, args)
} as (Subscription, [Any?]) -> Void


      
  }()

  public static let INVALIDATE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "invalidate"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_args_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> [Slot] {
    return newValue as! [Slot]
  }

  private func `_args_preSet_`(_ oldValue: Any?, _ newValue: [Slot]) -> [Slot] {
    return newValue
  }

  private func `_args_postSet_`(_ oldValue: Any?, _ newValue: [Slot]) {
    subToArgs_(newValue)
  }

  private func `_code_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> (([Any?]) -> Any?) {
    return newValue as! (([Any?]) -> Any?)
  }

  private func `_code_preSet_`(_ oldValue: Any?, _ newValue: @escaping (([Any?]) -> Any?)) -> (([Any?]) -> Any?) {
    return newValue
  }

  private func `_code_postSet_`(_ oldValue: Any?, _ newValue: @escaping (([Any?]) -> Any?)) {
    
  }

  private func `_value_factory_`() -> Any? {
    
return code(args.map { (slot) -> Any? in return slot.swiftGet() })
      
  }

  private func `_value_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_value_preSet_`(_ oldValue: Any?, _ newValue: Any?) -> Any? {
    return newValue
  }

  private func `_value_postSet_`(_ oldValue: Any?, _ newValue: Any?) {
    
  }

  private func `_cleanup__adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Subscription? {
    return newValue as! Subscription?
  }

  private func `_cleanup__preSet_`(_ oldValue: Any?, _ newValue: Subscription?) -> Subscription? {
    return newValue
  }

  private func `_cleanup__postSet_`(_ oldValue: Any?, _ newValue: Subscription?) {
    
  }

  public override func `swiftGet`() -> Any? {
    return value
  }

  public override func `swiftSet`(_ value: Any?) {
    // NOP
  }

  public override func `swiftSub`(_ listener: @escaping Listener) -> Subscription {
    
return sub(topics: ["propertyChange", "value"], listener: listener)
      
  }

  public func `subToArgs_`(_ slots: [Slot]) {
    
cleanup();
let subs = slots.map { (slot) -> Subscription in
  return slot.swiftSub(invalidate_listener)
}
cleanup_ = Subscription(detach: { for sub in subs { sub.detach() } })
      
  }

  func `cleanup`() {
    cleanup_listener(Subscription(detach: {}), [])
  }

  private func `cleanup_method`(_ sub: Subscription, _ args: [Any?]) {
    cleanup_?.detach()
  }

  func `invalidate`() {
    invalidate_listener(Subscription(detach: {}), [])
  }

  private func `invalidate_method`(_ sub: Subscription, _ args: [Any?]) {
    clearProperty("value")
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return ExpressionSlot.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return ExpressionSlot.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "args":
    _args_inited_ = false
    _args_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "args"]) {
      _ = pub(["propertyChange", "args", args$])
    }
    break

  case "code":
    _code_inited_ = false
    _code_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "code"]) {
      _ = pub(["propertyChange", "code", code$])
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

  case "cleanup_":
    _cleanup__inited_ = false
    _cleanup__ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "cleanup_"]) {
      _ = pub(["propertyChange", "cleanup_", cleanup_$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "args": return `_args_inited_`

  case "code": return `_code_inited_`

  case "value": return `_value_inited_`

  case "cleanup_": return `_cleanup__inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "args": return `args`

  case "code": return `code`

  case "value": return `value`

  case "cleanup_": return `cleanup_`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "args": return `args$`

  case "code": return `code$`

  case "value": return `value$`

  case "cleanup_": return `cleanup_$`


  case "subToArgs_": return `subToArgs_$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "args$":
    args$ = value as! Slot
    return
  case "args":
  
    let oldValue: Any? = _args_inited_ ? self.`args` : nil
    _args_ = _args_preSet_(oldValue, _args_adapt_(oldValue, value))
    _args_inited_ = true
    _args_postSet_(oldValue, _args_)
    if hasListeners(["propertyChange", "args"]) && !FOAM_utils.equals(oldValue, _args_) {
      _ = pub(["propertyChange", "args", args$])
    }
    return

  case "code$":
    code$ = value as! Slot
    return
  case "code":
  
    let oldValue: Any? = _code_inited_ ? self.`code` : nil
    _code_ = _code_preSet_(oldValue, _code_adapt_(oldValue, value))
    _code_inited_ = true
    _code_postSet_(oldValue, _code_)
    if hasListeners(["propertyChange", "code"]) && !FOAM_utils.equals(oldValue, _code_) {
      _ = pub(["propertyChange", "code", code$])
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

  case "cleanup_$":
    cleanup_$ = value as! Slot
    return
  case "cleanup_":
  
    let oldValue: Any? = _cleanup__inited_ ? self.`cleanup_` : nil
    _cleanup__ = _cleanup__preSet_(oldValue, _cleanup__adapt_(oldValue, value))
    _cleanup__inited_ = true
    _cleanup__postSet_(oldValue, _cleanup__)
    if hasListeners(["propertyChange", "cleanup_"]) && !FOAM_utils.equals(oldValue, _cleanup__) {
      _ = pub(["propertyChange", "cleanup_", cleanup_$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.core.ExpressionSlot"

    lazy var label: String = "Expression Slot"

    lazy var parent: ClassInfo? = Slot.classInfo()

    lazy var ownAxioms: [Axiom] = [ARGS,CODE,VALUE,CLEANUP_,SWIFT_GET,SWIFT_SET,SWIFT_SUB,SUB_TO_ARGS_,CLEANUP,INVALIDATE]

    lazy var cls: AnyClass = ExpressionSlot.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return ExpressionSlot(args, x)
    }

  }

}