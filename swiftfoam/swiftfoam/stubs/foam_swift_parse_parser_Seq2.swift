// GENERATED CODE. DO NOT MODIFY BY HAND.
import Foundation
public class Seq2: AbstractFObject, Parser {

  public var parsers: [Parser] {
    get {
      
if _parsers_inited_ {
  return _parsers_!
}

return []

      
    }
set(value) {
      
self.set(key: "parsers", value: value)
      
    }
  }

  var _parsers_: [Parser]! = nil

  var _parsers_inited_: Bool = false

  public static let PARSERS: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "parsers"
  let classInfo: ClassInfo
  let transient = false
  let label = "Parsers" // TODO localize
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

  private lazy var parsers_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "parsers",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var parsers_Value_Sub_: Subscription?

  public var parsers$: Slot {
    get {
      return self.parsers_Value_
    }
set(value) {
      
self.parsers_Value_Sub_?.detach()
self.parsers_Value_Sub_ = self.parsers$.linkFrom(value)
self.onDetach(self.parsers_Value_Sub_!)
      
    }
  }

  public var index1: Int {
    get {
      
if _index1_inited_ {
  return _index1_!
}

return 0

      
    }
set(value) {
      
self.set(key: "index1", value: value)
      
    }
  }

  var _index1_: Int! = nil

  var _index1_inited_: Bool = false

  public static let INDEX1: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "index1"
  let classInfo: ClassInfo
  let transient = false
  let label = "Index1" // TODO localize
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

  private lazy var index1_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "index1",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var index1_Value_Sub_: Subscription?

  public var index1$: Slot {
    get {
      return self.index1_Value_
    }
set(value) {
      
self.index1_Value_Sub_?.detach()
self.index1_Value_Sub_ = self.index1$.linkFrom(value)
self.onDetach(self.index1_Value_Sub_!)
      
    }
  }

  public var index2: Int {
    get {
      
if _index2_inited_ {
  return _index2_!
}

return 0

      
    }
set(value) {
      
self.set(key: "index2", value: value)
      
    }
  }

  var _index2_: Int! = nil

  var _index2_inited_: Bool = false

  public static let INDEX2: PropertyInfo = {
    
class PInfo: PropertyInfo {
  let name = "index2"
  let classInfo: ClassInfo
  let transient = false
  let label = "Index2" // TODO localize
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

  private lazy var index2_Value_: PropertySlot = {
    
let s = PropertySlot([
  "object": self,
  "propertyName": "index2",
])
self.onDetach(Subscription(detach: {
  s.detach()
}))
return s
      
  }()

  private(set) public var index2_Value_Sub_: Subscription?

  public var index2$: Slot {
    get {
      return self.index2_Value_
    }
set(value) {
      
self.index2_Value_Sub_?.detach()
self.index2_Value_Sub_ = self.index2$.linkFrom(value)
self.onDetach(self.index2_Value_Sub_!)
      
    }
  }

  lazy var parse$: Slot = {
    

return ConstantSlot([
  "value": { [weak self] (args: [Any?]) throws -> Any? in
    if self == nil { fatalError() }

    let ps = args[0] as! PStream

    let x = args[1] as! ParserContext

    
    return self!.`parse`(
        _: ps, _: x)
  }
])
      
  }()

  public static let PARSE: MethodInfo = {
    
class MInfo: MethodInfo {
  let name = "parse"
  let args: [MethodArg] = [] //TODO
  let classInfo: ClassInfo
  init(_ ci: ClassInfo) { classInfo = ci }
}
return MInfo(classInfo())
      
  }()

  private static var classInfo_: ClassInfo = ClassInfo_()

  private func `_parsers_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> [Parser] {
    return newValue as! [Parser]
  }

  private func `_parsers_preSet_`(_ oldValue: Any?, _ newValue: [Parser]) -> [Parser] {
    return newValue
  }

  private func `_parsers_postSet_`(_ oldValue: Any?, _ newValue: [Parser]) {
    
  }

  private func `_index1_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int {
  let max = Int(Int32.max)
  let min = Int(Int32.min)
  return i > max ? max : i < min ? min : i
}
return 0
        
  }

  private func `_index1_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_index1_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  private func `_index2_adapt_`(_ oldValue: Any?, _ newValue: Any?) -> Int {
    
var newValue = newValue
if let str = newValue as? String { newValue = Int(str) }
if let i = newValue as? Int {
  let max = Int(Int32.max)
  let min = Int(Int32.min)
  return i > max ? max : i < min ? min : i
}
return 0
        
  }

  private func `_index2_preSet_`(_ oldValue: Any?, _ newValue: Int) -> Int {
    return newValue
  }

  private func `_index2_postSet_`(_ oldValue: Any?, _ newValue: Int) {
    
  }

  public func `parse`(_ ps: PStream, _ x: ParserContext) -> PStream? {
    
var values = [Any?](repeating: nil, count: 2)
var ps: PStream? = ps
for (i, parser) in parsers.enumerated() {
  ps = parser.parse(ps!, x)
  if ps == nil { return nil }
  if i == index1 { values[0] = ps!.value() }
  if i == index2 { values[1] = ps!.value() }
}
return ps!.setValue(values)
      
  }

  public override func `ownClassInfo`() -> ClassInfo {
    return Seq2.classInfo_
  }

  public override class func `classInfo`() -> ClassInfo {
    return Seq2.classInfo_
  }

  public override func `clearProperty`(_ key: String) {
    switch key {

  case "parsers":
    _parsers_inited_ = false
    _parsers_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "parsers"]) {
      _ = pub(["propertyChange", "parsers", parsers$])
    }
    break

  case "index1":
    _index1_inited_ = false
    _index1_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "index1"]) {
      _ = pub(["propertyChange", "index1", index1$])
    }
    break

  case "index2":
    _index2_inited_ = false
    _index2_ = nil

  

    // Only pub if there are listeners.
    if hasListeners(["propertyChange", "index2"]) {
      _ = pub(["propertyChange", "index2", index2$])
    }
    break

  default:
    super.clearProperty(key)
}
  }

  public override func `hasOwnProperty`(_ key: String) -> Bool {
    switch key {

  case "parsers": return `_parsers_inited_`

  case "index1": return `_index1_inited_`

  case "index2": return `_index2_inited_`

  default:
    return super.hasOwnProperty(key)
}
  }

  public override func `get`(key: String) -> Any? {
    switch key {

  case "parsers": return `parsers`

  case "index1": return `index1`

  case "index2": return `index2`

  default:
    return super.get(key: key)
}
  }

  public override func `getSlot`(key: String) -> Slot? {
    switch key {

  case "parsers": return `parsers$`

  case "index1": return `index1$`

  case "index2": return `index2$`


  case "parse": return `parse$`

  default:
    return super.getSlot(key: key)
}
  }

  public override func `set`(key: String, value: Any?) {
    switch key {

  case "parsers$":
    parsers$ = value as! Slot
    return
  case "parsers":
  
    let oldValue: Any? = _parsers_inited_ ? self.`parsers` : nil
    _parsers_ = _parsers_preSet_(oldValue, _parsers_adapt_(oldValue, value))
    _parsers_inited_ = true
    _parsers_postSet_(oldValue, _parsers_)
    if hasListeners(["propertyChange", "parsers"]) && !FOAM_utils.equals(oldValue, _parsers_) {
      _ = pub(["propertyChange", "parsers", parsers$])
    }
    return

  case "index1$":
    index1$ = value as! Slot
    return
  case "index1":
  
    let oldValue: Any? = _index1_inited_ ? self.`index1` : nil
    _index1_ = _index1_preSet_(oldValue, _index1_adapt_(oldValue, value))
    _index1_inited_ = true
    _index1_postSet_(oldValue, _index1_)
    if hasListeners(["propertyChange", "index1"]) && !FOAM_utils.equals(oldValue, _index1_) {
      _ = pub(["propertyChange", "index1", index1$])
    }
    return

  case "index2$":
    index2$ = value as! Slot
    return
  case "index2":
  
    let oldValue: Any? = _index2_inited_ ? self.`index2` : nil
    _index2_ = _index2_preSet_(oldValue, _index2_adapt_(oldValue, value))
    _index2_inited_ = true
    _index2_postSet_(oldValue, _index2_)
    if hasListeners(["propertyChange", "index2"]) && !FOAM_utils.equals(oldValue, _index2_) {
      _ = pub(["propertyChange", "index2", index2$])
    }
    return

  default: break
}
super.set(key: key, value: value)
  }

  // GENERATED CODE. DO NOT MODIFY BY HAND.
  private class ClassInfo_: ClassInfo {
  
    lazy var id: String = "foam.swift.parse.parser.Seq2"

    lazy var label: String = "Seq2"

    lazy var parent: ClassInfo? = nil

    lazy var ownAxioms: [Axiom] = [PARSERS,INDEX1,INDEX2,PARSE]

    lazy var cls: AnyClass = Seq2.self

    func `create`(args: [String:Any?] = [:], x: Context) -> Any {
      return Seq2(args, x)
    }

  }

}