<!-- .slide: data-background="#003d73" -->
# Functions and Types

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

## Agenda

* Functions
  * First-class citizen
  * Infix/prefix
* Tuples and Records
* List
  * Polymorphism
  * Higher order Functions
* Code rules

---

# Functions

![I will not fight the future](./img/future.gif "From Giphy")

----

## Type inference

* F# compiler will try to determine type
  * If compiler cannot find type it will return error

```
let concat x = System.String.Concat(x);;

  let concat x = System.String.Concat(x);;
  ---------------^^^^^^^^^^^^^^^^^^^^^^^

<path>: error FS0041: A unique overload for method 'Concat'
could not be determined based on type information prior to
this program point. A type annotation may be needed.

Known type of argument: 'a
```

----

### Reading function types

```fsharp [1-2|3-4|5-6|7-8]
let addOne a = a+1
// val addOne: a: int -> int
let multiply a b = a*b
// val multiply: a: int -> b: int -> int
let apply f a = f a
// val apply: f: ('a -> 'b) -> a: 'a -> 'b
let applyTwo g a b = g a b
// val applyTwo: g: ('a -> 'b -> 'c) -> a: 'a -> b: 'b -> 'c
```

* `->` reads return
* All functions are curried
* Partial application


----

## First-class citizens

* Functions in F# are first class citizen
  * functions can be input and output from functions
* First-order functions
  * Takes values as paramters and/or returns values
* Higher order functions
  * Takes functions as parameters and/or return functions

Note:
C#, Java, etc also have functions as first class citizen

----

## Higher order functions

Functions as arguments

```fsharp
let operate f a = f a
// val operate : f:('a -> 'b) -> a:'a -> 'b

operate (fun a -> a+2) 3
```

Returns functions

```fsharp
let plusThree = (+) 3
// val plusThree : (int -> int)

plusThree 5
```


----

## Prefix and Infix operators

* Some operators are alwas prefix others can be both
  * Operators begining with `!` and any number of `~` except `!=` are prefix
  * `+`, `-`, `+.`, `-.`, `&`, `&&`, `%`, and `%%` can be both prefix and infix
  * Prefix operators defined by starting with `~`
  * `!`, `*`, `/`, `<`, `=`, `>`, `?`, `@`, `^`, `|`, `.` or a sequence of these can be used as infix

```fsharp
(op) // infix operator of op
(~op) // prefix operator of op
```

----

## Example

Infix:

```fsharp
let (|+|) a b =
    match (a, b) with
    | (Some(x), Some(y)) -> Some(x+y)
    | _ -> None
Some(2) |+| Some(4) // Some(6)
Some(3) |+| None // None
```

Prefix:

```fsharp
let (~+) a = a+42
+ 3 // 45
```

----

## Pipe

```fsharp
[2;3;4;5;6;6] |> List.filter (fun y -> y < 4)
// val it: int list = [2; 3]
List.filter (fun y -> y < 4) <| [2;3;4;5;6;6]
// val it: int list = [2; 3]
```

* Or 'function appliation operators'
* Operators `|>`, `||>` and `|||>`
* Works as in bash og Powershell

![Pipe](./img/pipe.jpg "Pipe") <!-- .element style="height: 250px;" -->

----

### Function composition

* Operators `>>` and `<<`

```fsharp
let addOne a = a+1
let convertToFloat a = float a
let whatIsThis = addOne >> convertToFloat
let result = whatIsThis 41
```

---

# Tuples

```fsharp
let t = ("foo", 42)
// val t : string * int = ("foo", 42)
let t2 = ([12;32], 3, "bar", 'a', t)
```

----

## Functions on tuples

* Predefined functions
```fsharp
fst ("foo", 42) // returns "foo"
snd ("foo", 42) // return 42
```
* Define functions with input 
```fsharp
// Deconstructing
let (str, num) = t
// or
let (l, num, bar, a, (str', num')) = t2
```

----

## Equality

* Requires that equality is defined for components
* Requires the components to be pair wise equal in type

```fsharp
(1, "foo", 'a') = (1, "bar", 'b') // false
(1, ("foo", 'a')) = (1, "foo", 'a')
// error FS0001: Type mismatch. Expecting a
//    'int * (string * char)'    
// but given a
//    'int * (string * char) * 'a'    
// The tuples have differing lengths of 2 and 3
```

----

## Ordering

* Requires ordering to defined for components
* Requires that components to be pair wise equal in type
* Is compared from left to right

!["Ordering](./img/sorting.jpg "Ordering") <!-- .element style="height: 300px; " -->

---

# Records

Defined as

```fsharp
type Course = { name: string; semester: string;
                students: int list; teacher: int}

```
with record labels `name`, `semester`, `students` and `teacher`

```fsharp
[ attributes ]
type [accessibility-modifier] typename =
    { [ mutable ] label1 : type1;
      [ mutable ] label2 : type2;
      ... }
    [ member-list ]
```

----

### Construction

To create values of Course type

```fsharp
let swafp = {name = "SWAF"; semester = "F21"; 
             students = []; teacher = 33 };;
// val swafp : Course = { name = "SWAF"
//      semester = "F21"  students = []
//                        teacher = 33 }
```

**Note**: type is inferred by type system


----

## Equality

* Requires equality to be defined for components
* Requires that components to be pairwise equal in type

```fsharp
type RecordTest = { X: int; Y: int }

let record1 = { X = 1; Y = 2 }
let record2 = { X = 1; Y = 2 }
record1 = record 2
// val it: bool = true
```

----

## Ordering

* Requires ordering to be defined for components
* Requires that components to be pairwise equal in type
* Is compared from left to right

----

## Patterns

Can use pattern to decompose records

```fsharp
let {name = n; semester = s; students = l; teacher = t } 
                    = swafp
val t : int = 33
val s : string = "F21"
val n : string = "SWAF"
val l : int list = []
```

---

# List

* From last time
```fsharp
let alphabet = ['a'; 'b'; 'c'; 'd']
```
* Can contain values, records, tuples, functions and lists
* Lists are finite
* Single chained linked list
    * `head` + `tail`


----

## Pattern matching

```fsharp
let x::xs = alphabet // matches a list
```

fails on empty list

```fsharp
> match alphabet with                        
-   | [] -> "empty"                          
-   | x::xs -> "first element " + (string x);;
// val it : string = "first element a"
```
<!-- .element: class="fragment" -->

----

### Operators

* `@` and `::` is an infix operators on lists. 

```fsharp
let l = 'a'::[]
// val l: char list = ['a']
let merged = ['a';'b'] @ ['c';'d']
// val merged : char list = ['a'; 'b'; 'c'; 'd']
```

**Note**: they bind differently

----

### Append and Reverse

* `List.append` same thing
* `List.rev` is from standard library

```fsharp
List.append ['a'; 'b'] ['c']
// val it: char list = ['a'; 'b'; 'c']
List.rev merged
// val it : char list = ['d'; 'c'; 'b'; 'a']
```

----

## Reverse (continued)

`List.rev` is an efficient way of reversing a list - oppose to the naive implemetation

```fsharp
let rec reverse = function
  | []    -> []
  | x::xs -> reverse xs @ [x]
```

This is not efficient because of the way `@` is works

```fsharp
[] @ ys = ys
[x0;x1;x2;x3] @ ys = x0 :: ([x1;x2;x3] @ ys)
```


----

## Alternativ to recursive functions

```fsharp [1-3|5]
let rec sum = function
    | []    -> 0
    | x::xs -> x+(sum xs)

let sum l = List.fold (fun acc elem -> acc+elem) 0 l
```

----

### map

Definition

```fsharp
List.map: ('a -> 'b) -> 'a list -> 'b list
```

Transforms a list of `'a`'s to a list of `'b`'s

Note:
Equavilant to Select in LINQ

----

### map examples

```fsharp
let list = [1;2;3;4;4;5]

List.map (fun element -> string element) list
// val it : string list = ["1"; "2"; "3"; "4"; "4"; "5"]
```

----

### map (maybe) a better example

```fsharp
let tempSF = [59;61;62;64;63;67;66;67;70;70;64;64;58;64]

let tempSFCelcisu = List.map
  (fun fahrenheit -> ((float fahrenheit) - 32.0) * (5.0/9.0))
  tempSF
let tempSFCelciusRounded =
  List.map (fun celcius -> Math.Round(celcius))
  tempSFCelcisu
//val it : float list =
//  [15.0; 16.0; 17.0; 18.0; 17.0; 19.0; 19.0; 19.0; 
//   21.0; 21.0; 18.0; 18.0; 14.0; 18.0]
```

----

### map works on many types

* Generally speaking maps applies an function `f` to a wrapped element(s)
* Given a 'normal' function `f: 'a -> 'b`
    * map applies this to zero, one or many wrapped elements e.g.
    * `'a list`, `Set<'a>`, `Map<'a>`
    * `'a option`
    * etc.
* Map is always 
`$ O(n) $`

----

### fold

Definition:

```
List.fold: ('a -> 'b -> 'a) -> 'a -> 'b list -> 'a
```

Accumulates a list given a initial value and a function that takes a list element and a accumulative value.

* `('a -> 'b -> 'a)` function that accumulate a list element and a partial result
* `'a` an initial value

----

### fold example

Counting number of element in list

* Initial value? <!-- .element: class="fragment"  data-fragment-index="1" -->

* Function?  <!-- .element: class="fragment"  data-fragment-index="2" -->

```fsharp
let list = [1;2;3;4;4;5]

List.fold (fun acc elem -> acc+1) 0 list
//val it : int = 6
```
<!-- .element: class="fragment"  data-fragment-index="3" -->

Translate to <!-- .element: class="fragment"  data-fragment-index="4" -->

f (f (f (f (f (f (f 0 1) 2) 3) 4) 4) 5)  <!-- .element: class="fragment"  data-fragment-index="4" -->


----

### A better fold example

Insertion sort defined by List.fold

```fsharp
List.fold (fun acc i ->
  let (f, b) = span (fun e -> e < i) acc
  f @ (i :: b)
) [] [12;54;2;1;15;6;21;1;5;5;6]
// val it : int list = [1; 1; 2; 5; 5; 6; 6; 12; 15; 21; 54]
```

span is a function that splits input list (see exercises)

Note:
```fsharp
let span p list =
    let rec spanUtil acc l =
        if (not (List.isEmpty l) && (p (List.head l))) then
            spanUtil (acc @ [List.head l]) (List.tail l)
        else
            (acc, l)
    spanUtil [] list
```

----

### fold in general

* Fold like map is defined on many types
     * Sets, Maps, and many more
* Fold is tail recursive - stack secure
* Fold is specific in the direction it calculates
* Fold is always `$ O(n) $`

----

### foldBack

Definition

```
foldBack: ('a -> 'b -> 'b) -> 'a list -> 'b -> 'b
```

* Accumulate in the opposite order from `fold`
* Order of paramters are different
* FoldBack is always `$ O(n) $`

----

### Differences

```fsharp
List.fold (fun a i -> a - i) 100 [1; 3; 8]
// val it : int = 88

List.foldBack (fun a i -> a - i) [1; 3; 8] 100
// val it : int = -94
```

* fold: (((100 - 1) - 3) - 8) <!-- .element: class="fragment"  data-fragment-index="1" -->
* foldBack: (1 - (3 - (8 - 100))) <!-- .element: class="fragment"  data-fragment-index="1" -->

----

### Zip

Combines two or three lists together

```fsharp
zip: 'a list -> 'b list -> ('a*'b) list
zip3: 'a list -> 'b list -> c' list -> ('a*'b*'c) list
```

```fsharp
List.zip [1;2;3;4] ['2';'4';'6';'8']
val it: (int * char) list = [(1, '2'); (2, '4'); (3, '6'); (4, '8')]

> List.zip [1;2;3;4] [2;4;6;8;2]
System.ArgumentException: The lists had different lengths.
list1 is 1 element shorter than list2 (Parameter 'list1')
Stopped due to error

```


---

# Code rules

* Set of dogma rules to guide our code
* Can be used to challange ourself
* **Note**: Slides will not adhere to these rules

----

## Rules

1. Name everything
2. No mutable state
3. Exhaustive conditionals
4. No intermediate variables
5. Only expressions
6. No explicit recursion
7. Generic building blocks
8. Side effects at boundaries
9. ~~Only infinite sequences~~
10. ~~One argument functions~~

----

## Explanation (1/3)

* __Name everything__[1] all functions must have a name -> no lambda
  * Become better at recognizing patterns
* __No mutable state__ don't use mutable data types
  * Write referential transparent functions
* __Exhaustive conditionals__ use patterns matching
  * Write complete functions

----

## Explanation (2/3)

* __No intermediate variables__ Do not use any variables in functions
  * Better understading of pipelines and composition
* __Only expressions__ 
  * Avoid side effects
* __No explicit recursion__ No `let rec`
  * Learning HoF like map
* __Generic building blocks__ e.g. use collections instead of list
  * easier to write resuable code

----

## Explanation (3/3)

* __Side effects at boundaries__ core business logic should have no side effects
  * Control where side effects happens
* __Only infinite sequences__[2] only depend on infinite sequnces, no lists
  * Could increase performance because of the lazy properties
* __One argument functions__[1] Each function should have a single argument - not depending on currying


----

### Notes

[1] Hard

[2] No taught in details here but look at chapter 11 


---

## References

TODO: insert ref to The Rules