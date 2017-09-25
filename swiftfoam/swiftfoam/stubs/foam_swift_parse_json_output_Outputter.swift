// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Outputter: AbstractFObject {

  public var beforeKey: String {
    get {
      
if _beforeKey_inited_ {
  return _beforeKey_!
}

return "\""

      
    }
set(value) {
      
self.set(key: "beforeKey", value: value)
      
    }
  }

  var _beforeKey_: String! = nil

  var _beforeKey_inited_: Bool = false

  public static let BEFORE_KEY: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "beforeKey"
  let classInfo: ClassInfo
  let transient = false
  let label = "Before Key" // TODO localize
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

  private lazy var beforeKey_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "beforeKey",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var beforeKey_Value_Sub_: Subscription?

  public var beforeKey$: Slot {
    get {
      return self.beforeKey_Value_
    }
set(value) {
      
self.beforeKey_Value_Sub_?.detach()
self.beforeKey_Value_Sub_ = self.beforeKey$.linkFrom(value)
self.onDetach(self.beforeKey_Value_Sub_!)
      
    }
  }

  public var afterKey: String {
    get {
      
if _afterKey_inited_ {
  return _afterKey_!
}

return "\""

      
    }
set(value) {
      
self.set(key: "afterKey", value: value)
      
    }
  }

  var _afterKey_: String! = nil

  var _afterKey_inited_: Bool = false

  public static let AFTER_KEY: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "afterKey"
  let classInfo: ClassInfo
  let transient = false
  let label = "After Key" // TODO localize
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

  private lazy var afterKey_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "afterKey",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var afterKey_Value_Sub_: Subscription?

  public var afterKey$: Slot {
    get {
      return self.afterKey_Value_
    }
set(value) {
      
self.afterKey_Value_Sub_?.detach()
self.afterKey_Value_Sub_ = self.afterKey$.linkFrom(value)
self.onDetach(self.afterKey_Value_Sub_!)
      
    }
  }

  lazy var outputProperty$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    var out = args[0] as! String

    let o = args[1] as! FObject

    let p = args[2] as! PropertyInfo

    
    return self!.`outputProperty`(
        _: &out, _: o, _: p)
  }
])
      
  }()

  public static let OUTPUT_PROPERTY: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "outputProperty"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var escape$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let data = args[0] as! String

    
    return self!.`escape`(
        _: data)
  }
])
      
  }()

  public static let ESCAPE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "escape"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var outputNil$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    var out = args[0] as! String

    
    return self!.`outputNil`(
        _: &out)
  }
])
      
  }()

  public static let OUTPUT_NIL: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "outputNil"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var outputString$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    var out = args[0] as! String

    let data = args[1] as! String

    
    return self!.`outputString`(
        _: &out, _: data)
  }
])
      
  }()

  public static let OUTPUT_STRING: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "outputString"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var outputBoolean$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    var out = args[0] as! String

    let data = args[1] as! Bool

    
    return self!.`outputBoolean`(
        _: &out, _: data)
  }
])
      
  }()

  public static let OUTPUT_BOOLEAN: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "outputBoolean"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var outputMap$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    var out = args[0] as! String

    let data = args[1] as! [String:Any?]

    
    return self!.`outputMap`(
        _: &out, _: data)
  }
])
      
  }()

  public static let OUTPUT_MAP: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "outputMap"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var outputArray$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    var out = args[0] as! String

    let data = args[1] as! [Any?]

    
    return self!.`outputArray`(
        _: &out, _: data)
  }
])
      
  }()

  public static let OUTPUT_ARRAY: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "outputArray"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var outputNumber$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    var out = args[0] as! String

    let data = args[1] as! NSNumber

    
    return self!.`outputNumber`(
        _: &out, _: data)
  }
])
      
  }()

  public static let OUTPUT_NUMBER: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "outputNumber"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var output$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    var out = args[0] as! String

    let data = args[1]

    
    return self!.`output`(
        _: &out, _: data)
  }
])
      
  }()

  public static let OUTPUT: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "output"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var outputFObject$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    var out = args[0] as! String

    let data = args[1] as! FObject

    
    return self!.`outputFObject`(
        _: &out, _: data)
  }
])
      
  }()

  public static let OUTPUT_FOBJECT: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "outputFObject"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  lazy var swiftStringify$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let data = args[0] as! FObject

    
    return self!.`swiftStringify`(
        _: data)
  }
])
      
  }()

  public static let SWIFT_STRINGIFY: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "swiftStringify"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_beforeKey_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_beforeKey_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_beforeKey_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  private func `_afterKey_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> String {
    
if let newValue = newValue as? String { return newValue }
if newValue != nil { return String(describing: newValue!) }
return ""
        
  }

  private func `_afterKey_preSet_`(_ oldValue: Any?, _ newValue: String) -> String {
    return newValue
  }

  private func `_afterKey_postSet_`(_ oldValue: Any?, _ newValue: String) {
    
  }

  public func `outputProperty`(_ out: inout String, _ o: FObject, _ p: PropertyInfo) {
    
out.append(beforeKey)
out.append(p.name)
out.append(afterKey)
out.append(":")
p.toJSON(outputter: self, out: &out, value: p.get(o))
      
  }

  public func `escape`(_ data: String) -> String {
    
return data.replacingOccurrences(of: "\"", with: "\\\"")
      
  }

  public func `outputNil`(_ out: inout String) {
    
out.append("null")
      
  }

  public func `outputString`(_ out: inout String, _ data: String) {
    
out.append("\"")
out.append(escape(data))
out.append("\"")
      
  }

  public func `outputBoolean`(_ out: inout String, _ data: Bool) {
    
out.append(data ? "true" : "false")
      
  }

  public func `outputMap`(_ out: inout String, _ data: [String:Any?]) {
    
out.append("{")
for (i, d) in data.keys.enumerated() {
  outputString(&out, d)
  out.append(":")
  output(&out, data[d]!)
  if i < data.count - 1 { out.append(",") }
}
out.append("}")
      
  }

  public func `outputArray`(_ out: inout String, _ data: [Any?]) {
    
out.append("[")
for (i, d) in data.enumerated() {
  output(&out, d)
  if i < data.count - 1 { out.append(",") }
}
out.append("]")
      
  }

  public func `outputNumber`(_ out: inout String, _ data: NSNumber) {
    
out.append(data.stringValue)
      
  }

  public func `output`(_ out: inout String, _ data: Any?) {
    
if let data = data as? FObject {
  outputFObject(&out, data)
} else if let data = data as? String {
  outputString(&out, data)
} else if let data = data as? Bool {
  outputBoolean(&out, data)
} else if let data = data as? NSNumber {
  outputNumber(&out, data)
} else if let data = data as? [Any?] {
  outputArray(&out, data)
} else if let data = data as? [String:Any?] {
  outputMap(&out, data)
} else if data == nil {
  outputNil(&out)
}
      
  }

  public func `outputFObject`(_ out: inout String, _ data: FObject) {
    
let info = data.ownClassInfo()
out.append("{")

out.append(beforeKey)
out.append("class")
out.append(afterKey)
out.append(":")
outputString(&out, info.id)

for p in info.axioms(byType: PropertyInfo.self) {
  if !p.transient && data.hasOwnProperty(p.name) {
    out.append(",")
    outputProperty(&out, data, p)
  }
}

out.append("}");
      
  }

  public func `swiftStringify`(_ data: FObject) -> String {
    
var s = ""
output(&s, data)
return s
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Outputter.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Outputter.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "beforeKey":
    _beforeKey_inited_ = false
    _beforeKey_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "beforeKey"]) {
      _ = pub(["propertyChange", "beforeKey", beforeKey$])
    }
    break

  case "afterKey":
    _afterKey_inited_ = false
    _afterKey_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "afterKey"]) {
      _ = pub(["propertyChange", "afterKey", afterKey$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "beforeKey": return `_beforeKey_inited_`

  case "afterKey": return `_afterKey_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "beforeKey": return `beforeKey`

  case "afterKey": return `afterKey`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "beforeKey": return `beforeKey$`

  case "afterKey": return `afterKey$`


  case "outputProperty": return `outputProperty$`

  case "escape": return `escape$`

  case "outputNil": return `outputNil$`

  case "outputString": return `outputString$`

  case "outputBoolean": return `outputBoolean$`

  case "outputMap": return `outputMap$`

  case "outputArray": return `outputArray$`

  case "outputNumber": return `outputNumber$`

  case "output": return `output$`

  case "outputFObject": return `outputFObject$`

  case "swiftStringify": return `swiftStringify$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "beforeKey$":
    beforeKey$ = value as! Slot
    return
  case "beforeKey":
  
    let oldValue: Any? = _beforeKey_inited_ ? self.`beforeKey` : nil
    _beforeKey_ = _beforeKey_preSet_(oldValue, _beforeKey_adapt_(oldValue, value))
    _beforeKey_inited_ = true
    _beforeKey_postSet_(oldValue, _beforeKey_)
    if hasListeners(["propertyChange", "beforeKey"]) && !FOAM_utils.equals(oldValue, _beforeKey_) {
      _ = pub(["propertyChange", "beforeKey", beforeKey$])
    }
    return

  case "afterKey$":
    afterKey$ = value as! Slot
    return
  case "afterKey":
  
    let oldValue: Any? = _afterKey_inited_ ? self.`afterKey` : nil
    _afterKey_ = _afterKey_preSet_(oldValue, _afterKey_adapt_(oldValue, value))
    _afterKey_inited_ = true
    _afterKey_postSet_(oldValue, _afterKey_)
    if hasListeners(["propertyChange", "afterKey"]) && !FOAM_utils.equals(oldValue, _afterKey_) {
      _ = pub(["propertyChange", "afterKey", afterKey$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.json.output.Outputter"

    lazy var label: String = "Outputter"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [BEFORE_KEY,AFTER_KEY,OUTPUT_PROPERTY,ESCAPE,OUTPUT_NIL,OUTPUT_STRING,OUTPUT_BOOLEAN,OUTPUT_MAP,OUTPUT_ARRAY,OUTPUT_NUMBER,OUTPUT,OUTPUT_FOBJECT,SWIFT_STRINGIFY]

    lazy var cls: AnyClass = Outputter.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Outputter(args, x)
    }

  }

}