<!-- .slide: data-background="#003d73" -->
## Introduction + F# #

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

## Agenda

* Introduction
* What is FP
* Why F\#
* Program files
* F\#
  * Types
  * Functions
* Lists


---

<!-- .slide: data-background-image="./img/introduction.jpg" -->
## Introduction <!-- .element style="color: white" -->

----

## Qualification description

* **Apply** and **explain** functional programing as a programing paradigm
* **Design** and **implement** solutions building on functional programing
* **Explain** the Actor model
* **Design** and **implement** solutions with the Actor model
* **Design**, **explain** and **combine** functional design patterns when developing applications

----

### Format

* Lecture:
  * 4 hours per week
  * ~`$\frac{1}{2}$` lecturing
  * ~`$\frac{1}{2}$` exercises
* Read before, exercises after

----

### Plan

![Schedule](./img/Schedule.png "Schedule") <!-- .element: style="height: 600px" -->

----

### Expectations

- &#128187; Prepare **and** do exercises
- &#128587; **Ask** questions and make comments
- &#9200; Handin assignment on time

----

### Your expectations

&#10067; <!-- .element: style="font-size: 160px" -->

Please answer <!-- .element: class="fragment" data-fragment-index="1" -->  [Precourse form](https://forms.gle/xyU9uMwqXCf48Cap6) <!-- .element:  class="fragment" data-fragment-index="1" -->

![QR](./img/precourse_qe.png "") <!-- .element: style="width: 200px" class="fragment" data-fragment-index="1" -->

----

### Assignments

Fitness app (but you can choose your own domain)

| Name                 | "Handin" |
|----------------------|-------:|
| Domain model         | 5      |
| Business logic + test| 7      |
| Error handling       | 9      |
| Frontend             | 12     |
| Notification         | 15     | 
<!-- .element: style="font-size: 26px" -->

Feedback given if
* Deadline respected
* Material is a honest try at solve the problem



----

### Exam

- 30 minutes oral exam
  - Draw a subject (*5-10 haven't been choosen yet*)
  - Explain theory **and** show how this is applied
  - Include exercises/assignments when you see fit

---

## What is Functional programing

Applying and composing of functions

----

### Imperative vs Declarative

- Imperative
  - Procedural (C)
  - OOP (C++, C#)
- Declarative <!-- .element: class="fragment" data-fragment-index="1" -->  
  - Functional (F\#) <!-- .element: class="fragment" data-fragment-index="1" -->  
  - Logic (Prolog) <!-- .element: class="fragment" data-fragment-index="1" -->  


----

### In ...

* imperative programing one would
  * use statements to modify state
  * focus on how the program should achieve its goal
* declarative the focus is on <!-- .element: class="fragment" data-fragment-index="1" -->  
  * expressing commands <!-- .element: class="fragment" data-fragment-index="1" -->  
  * focus on what should be accomplished <!-- .element: class="fragment" data-fragment-index="1" -->  

----


### Side effects

Which we want to avoid
- Changing value of variable<!-- .element: class="fragment" data-fragment-index="1" -->
- I/O<!-- .element: class="fragment" data-fragment-index="2" -->
- Throwing an exception<!-- .element: class="fragment" data-fragment-index="3" -->
- &#9758; We are going to try minimize and control side-effects<!-- .element: class="fragment" data-fragment-index="4" -->  
  - **not** removing them altogheter<!-- .element: class="fragment" data-fragment-index="4" -->  
  - the same with controlflow<!-- .element: class="fragment" data-fragment-index="4" -->  

----

### Other concepts

- Functions as first class citizen<!-- .element: class="fragment" --> 
- Higher order functions<!-- .element: class="fragment" --> 
- Pure functions<!-- .element: class="fragment" --> 
- Recursion<!-- .element: class="fragment" --> 
- Referential transparency<!-- .element: class="fragment" --> 
- Immutability<!-- .element: class="fragment" --> 


----

### Why FP

- Makes us better OOP developers<!-- .element: class="fragment" -->
- Help us develop more modular code<!-- .element: class="fragment" -->
- Makes writing testable code easy<!-- .element: class="fragment" -->
- Can help us write 'efficient' code<!-- .element: class="fragment" -->
- Less code -> fewer bugs<!-- .element: class="fragment" -->
- Fairly simple and clean syntax<!-- .element: class="fragment" -->


----

### Disadvantages

- Learning curve is steap
- A bit like starting from scratch

![Learning curve FP vs OOP](./img/programming_languages_curve.png "Learning curve") <!-- .element: style="width: 500px" -->

----

### Personal experience with FP

* Been using FP with OOP since 2012
* Fluent in Scala and F#
* Know some SML and Haskell


---

## Why F#

- forces you to think in a different way
- strong type system
- easy to learn syntax
- has access to .NET standard library
- works with .NET
- builds to .NET IL
- OOP possible in F#

Note:

- No higher kinded types
- Fewer OOP features

----

## Usages of F#

* 'Normal programs'<!-- .element: class="fragment" data-fragment-index="1" -->
* GUI<!-- .element: class="fragment" data-fragment-index="2" -->
* Scripting (.fsx files)<!-- .element: class="fragment" data-fragment-index="3" -->
* Web <!-- .element: class="fragment" data-fragment-index="4" -->
  * backend<!-- .element: class="fragment" data-fragment-index="4" -->
  * can even be compiled to JS<!-- .element: class="fragment" data-fragment-index="4" -->
* Deployment scripts to Azure<!-- .element: class="fragment" data-fragment-index="5" -->

----

## Program files

Creating a project*
- Commandline
- Jetbrains Rider
- Visual Studio

----

### File order matters

- Create Library2.fs

```fsharp
// Library2.fs
module Talk =
    let reply replier = printf "Reply from %s" replier
```

- Reference Talk.Reply from existing file

```fsharp
// Library.fs
module Say =
    let hello name =
        printfn "Hello %s" name
        Talk.reply "me"
```

swtafp/TestProjectCmd/Library/Library.fs(6,9): error FS0039: The value, namespace, type or module 'Talk' is not defined. Maybe you want one of the following:   tan [swtafp/TestProjectCmd/Library/Library.fsproj] <!-- .element: style="color: red; font-size: 18px" -->

----

### Main entrypoint

```fsharp
[<EntryPoint>]
let main argv =
    Say.hello "F#"
    0 // return an integer exit code
```

In newer .NET projects, this is more like C#

----

### Interactive shell

- F\# and other functional languages are explorative by nature
- The interactive shell lets you try out code easy

----

### Interactive example

![F\# interactive with examples](./img/interactive.png "F\# interactive")

----

### Modules

- Modules are used to group code
  - types, functions, and values
  - keeps related code together
  - if no module is declared a module with the same name as the file exists<!-- .element: class="fragment" data-fragment-index="1" -->
  - two types:<!-- .element: class="fragment" data-fragment-index="2" -->
    - top level<!-- .element: class="fragment" data-fragment-index="2" -->
    - local level (can be nested)<!-- .element: class="fragment" data-fragment-index="2" -->


----

### Namespaces

- Namespace lets you organize F\# programming related elements.
  - Must be top level in a file<!-- .element: class="fragment" data-fragment-index="1" -->
  - All code in that file becomes part of that namespace<!-- .element: class="fragment" data-fragment-index="2" -->
  - Cannot contain functions or values directly<!-- .element: class="fragment" data-fragment-index="3" -->
  - Only contain types and modules<!-- .element: class="fragment" data-fragment-index="4" -->
  - Can be declared implicitly<!-- .element: class="fragment" data-fragment-index="5" -->
- Styleguide prefer namespaces in all files<!-- .element: class="fragment" data-fragment-index="6" -->
  - because of interopbillity with C#<!-- .element: class="fragment" data-fragment-index="6" -->

----

### Signature files (.fsi)

- `FileName.fsi`&nbsp;is&nbsp;signature&nbsp;file&nbsp;for&nbsp;`FileName.fs`
- Signature file describes
  - Types
  - Namespaces
  - Modules


**Note**: We will get back to these

----

#### .fsi .fs examples

```fsharp
// Module1.fsi

namespace Library1
  module Module1 =
    val function1 : int -> int
    type Type1 =
        new : unit -> Type1
        member method1 : unit -> unit
        member method2 : unit -> unit
```


```fsharp
// Module1.fs
namespace Library1

module Module1 =
    let function1 x = x + 1

    type Type1() =
        member type1.method1() =
            printfn "type1.method1"
        member type1.method2() =
            printfn "type1.method2"
```

----

### Scripting files (fsx)

* As other scripting langauge (bash, powershell)
* Is not compiled
* Execute in terminal: 

```bash
$ dotnet fsi filename.fsx
```

---

## F# #

![F\#](./img/fsharp.png "F\#")

Language intro

----

### Numeric types

- '`int`' - 32 bit integers (1, -10021, 21, 42, ...)
- '`float`' - 64 bit float (1.0, -10021.0, -0.2, -1.2001, 3.2e2, ...)
- '`int64`' - 64 bit integer (1L, -10021L, 42L)
- '`single`' - 32 bit float (1.0f, 3.14159f, 42.2e3, 000)
 

----

### Operators
- `+`, `-`, `*`, `/`, `%` on all numeric types
  - Both operands must have same type
  ```fsharp
  // Not
  2 + 3.0
  //  The type 'float' does not match the type 'int'
  ```
- `**` on '`floats`'
- Bitwise on int
- Conversion with function named after type
  - `int 3.0 -> 3`

----

### Boolean values

- Type '`bool`' has values `true` and `false`
- Operators `&&`, `||`, and `not`
- Operators that return boolean
  - `=`, `<`, `<=`, `=>`, `>`, `<>`

----

### Conditional

- if-then-else expresion
```fsharp
if x > 0 then 1 else 0
```
- Note: the two branches must have same type
  ```fsharp
  // not
  if x > 0 then 1 else 'a'
  // All branches of an 'if' expression must return
  // values implicitly convertible to the type of
  // the first branch, which here is 'int'. This
  // branch returns a value of type 'char'.
  ```

----

### Char

- Type '`char`' 
- Syntax `'c', 'a', 'b', '\t', '\n'`

----

### Strings:
- Type '`string`'
- Can represent `string` as `char list` (more on lists later)
- Operators `+`, `[i]`, `[i..j]`, `[i..]`, `[..i]`
  * *Depracated* ~~`.[i]`, `.[i..j]`, `.[i..]`, `.[..i]`~~ 
- Functional vs 'dot' operator
  - `String.length "Hello f#"`
  - `"Hello F#".Length`
- Concat like in C#
  - `let result = "Hello" + " World!"`

----

### Functions

- Syntax without parentheses around arguments
  - `sqrt 10.0`
  - `String.length "Hello F#"`
- Function application bind hardest
  - `sqrt 10.0 + 2.0` => `(sqrt 10.0) + 2.0`

----

### Binding values

- variables
```fsharp
let phi = 3.14159
// val phi : float = 3.14159
```
- functions 
```fsharp
let identity a = a
// val identity: a: 'a -> 'a
let max x y = if x > y then x else y
// val max : x:'a -> y:'a -> 'a when 'a : comparison
```

----

### Lambda

* Lambdas in F# can be defined by the `fun` keyword

```fsharp
fun a b -> a + b
// Or
let fn = fun a b -> a + b
// Or with types
fun (a: int) (b: int) -> a + b
```

----

### Type declaration

- Not forced to write types to expression `max` or `phi`
  - F\# has strong *type inference*
- Possible to explicit define types

```fsharp
let maxInt (x: int) y = if x > y then x else y
// val maxInt : x:int -> y:int -> int`
// let maxInt (x: int) (y:int) = if x > y then x else y
// let maxInt (x: int) (y:int) : int =
//       if x > y then x else y
```

----

### Recursion

- Factorial definition: 
  - `0! = 1`
  - `n! = n * ((n-1)!)` for `n > 0`
- In F\#
   - Keyword '`rec`'

```fsharp
let rec factorial n =
  if (n = 0) then 1
  else n * factorial (n-1)
```
<!-- .element: class="fragment" data-fragment-index="1" -->

----

### Pattern Matching

- F# case construct expresion
  ```fsharp
  match expr with
    | pattern1 [when condition] -> expr1
    | pattern2 -> expr2
  ```

- Cases are checked in order, first match is executed
- Compiler will warn if cases are not exhausted
- Pattern matching allows another definition in F\# for factorial



----

### Factorial with case construct

Could redefine factorial with case constructs

```fsharp
let rec factorial n =
  match n with
  | 0 -> 1
  | _ -> n * factorial (n-1)
```

Here `_` is a wildcard that mactches everything

Note:

Keyword `function` is a shorthand for `fun` and a `match` in functions that takes a singel argument

```fsharp
let rec factororial = function
  | 0 -> 1
  | _ -> n * factorial (n-1)
```

----

### Pattern matching

```fsharp
type OptionalInt = | Some of int | None 

let optionalInt = Some 1

match optionalInt with 
| Some x -> printfn "Value is %A" x
| None -> printfn "No value" 
```

----

### Pattern matching

```fsharp
type Result =
    | Ok of string
    | Error of string

let result = Error "File not found"

match result with
| Ok result -> printfn "Success with result %A" result
| Error reason -> printfn "Error with reason: %s" reason
```

----

### Simpel type - tuples 

- Tuples
```fsharp
(1,2)
// val it : int * int = (1, 2)
(1, "a")
// val it : int * string = (1, "a")
```

- Access with:
  - functions '`fst`' or '`snd`'
  - **or** pattern mathing - with deconstruction

---


## Lists

* List in F# can be arbitrary long but **must** contain elements of same type
  * Give type "`'a`" then a list of `'a`'s have type<br/> "`'a list`"
  * Examples `int list`, `char list`, `string list`, `('a -> 'b) list`

----

### Construction

Building list can be done staticly with the `[]` list constructor

```fsharp
let l1 = [1; 2; 3; 4; 5]
```

or dynamicly with the `::` *cons* operator

```fsharp
let l2 = 1::2::3::4::5::[]
let l3 = 1::(2::(3::(4::(5::[]))))

```
`::` is right-assiciative

----

### Visualize a list

![List](./img/list.jpg "List") <!-- .element: style="width:700px" -->


----

### Working with lists

There are a number of functions for `list`s, all found in the [List module](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-listmodule.html).

```fsharp
let l1 = ["abc", "def", "ghi"]
List.head l1 // => "abc"
List.isEmpty l1 // => false
List.length l1 // => 3
```

----

### A couple of functions on lists

```fsharp
let l1 = [1;2;3]
let l2 = [4;5;6]

let l1' = 0 :: l1

let l1Plus2 = List.append l1 l2
let l1Plus2' = l1 @ l2
```

We will get back to the List module in next week<!-- .element: class="fragment" -->

----

### Functions on list


Defining a sum function for lists:

```fsharp
let rec sum l =
  if List.isEmpty l
  then 0
  else List.head l + sum (List.tail l)
```

or with pattern matching <!-- .element:  class="fragment" data-fragment-index="1" -->

```fsharp
let rec sum l =
  match l with
  | [] -> 0
  | (x::xs) -> x + sum xs
```
 <!-- .element:  class="fragment" data-fragment-index="1" -->


----

### Two things about last example

* Pattern matching can decompose any data structures directly in the match expression
*<!-- .element: class="fragment" data-fragment-index="1" -->  `function`<!-- .element: class="fragment" data-fragment-index="1" --> vs `match x with`<!-- .element: class="fragment" data-fragment-index="1" -->

```fsharp
let rec sum = function
  | [] -> 0
  | (x::xs) -> x + sum xs
```
<!-- .element: class="fragment" data-fragment-index="1" -->

---

<!-- .slide: data-background-image="./img/hard.jpg" -->

----

## References

* [Namespaces](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/namespaces)
* [Module](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/modules)
* [Match](https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/pattern-matching)
* [List module](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-collections-listmodule.html)
* [Convention](https://docs.microsoft.com/en-us/dotnet/fsharp/style-guide/conventions)