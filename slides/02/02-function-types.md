<!-- .slide: data-background="#003d73" -->
# Functions and Types

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

## Agenda

* Functions
  * First-class citizen
  * Infix/prefix
* Tuples
* Records
* List
  * Polymorphism
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

## First-class citizens

* Functions in F# are first class citizen
  * This means that functions can be input and output from functions
* First-order functions
  * Takes values as paramters and/or returns values
* Higher order functions
  * Takes functions as parameters and/or return functions

----

## Higher order functions

Functions as arguments

```fsharp
let operate f a = f a
// val operate : f:('a -> 'b) -> a:'a -> 'b

operate (fun a -> a+2) 3
```

Functions as parameters

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

Or 'function appliation operators'

```fsharp
[2;3;4;5;6;6] |> List.filter (fun y -> y < 4) // [2;3]
List.filter (fun y -> y < 4) <| [2;3;4;5;6;6] // [2;3]
```

Works as in bash og Powershell

![Pipe](./img/pipe.jpg "Pipe") <!-- .element style="height: 300px;" -->

----

## Equality

* Equality works as in other languages with operators `=` and `<>`

```fsharp
let eq x y = if (x <> y) then "not equal" else "equal";;
// val eq : x:'a -> y:'a -> string when 'a : equality
```

* which means any type with equality

----

## Ordering

* Operators `>`, `>=`, `<=` and `<`

```fsharp
let greater x y = if (x > y) then "greater" else "smaller";;
// val greater : x:'a -> y:'a -> string when 'a : comparison
```

* Do not work on functions - for same reasons as equality

---

# Tuples

* Defined as

```fsharp
let t = ("foo", 42)
// val t : string * int = ("foo", 42)
let t2 = ([12;32], 3, "bar", 'a', t)
```

* Deconstuction

```fsharp
let (f, i) = t
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
let first (x, y) = x
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

To create values of Course type

```fsharp
let swafp = {name = "SWAF"; semester = "F21"; 
             students = []; teacher = 33 };;
// val swafp : Course = { name = "SWAF"
//      semester = "F21"  students = []
//                        teacher = 33 }
```

----

## Equality

* Requires ordering to defined for components
* Requires that components to be pair wise equal in type

----

## Ordering

* Requires ordering to defined for components
* Requires that components to be pair wise equal in type
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

From last time

```fsharp
let alphabet = ['a'; 'b'; 'c'; 'd']
```

can containe values, records, tuples, functions and lists

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

----

## Append and Reverse

```fsharp
let merged = ['a';'b'] @ ['c';'d']
// val merged : char list = ['a'; 'b'; 'c'; 'd']
```

`@` is an infix operator to append lists.

`List.rev` is from standard library

```fsharp
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

This is not efficient because of the way `@` is implemented

```fsharp
[] @ ys = ys
[x0;x1;x2;x3] @ ys = x0 :: ([x1;x2;x3] @ ys)
```

---

# Code rules

* Set of dogma rules to guide your code
* Can be used to challange yourself.

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