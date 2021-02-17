<!-- .slide: data-background="#003d73" -->
# Sets + Maps

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

----

## Agenda

* Lists
    * map
    * fold
* Sets
    * union, intersect & difference
* Maps
    * foldBack
* Equality

---

## List

* Are finite
* Single chained linked list
    * `head` + `tail`

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

----

### map examples

```fsharp
let list = [1;2;3;4;4;5]

List.map (fun y -> string y) list;;
// val it : string list = ["1"; "2"; "3"; "4"; "4"; "5"]
```

----

### map (maybe) a better example

```fsharp
let tempSF = [59;61;62;64;63;67;66;67;70;70;64;64;58;64]

List.map (fun f -> ((float f) - 32.0) * (5.0/9.0)) tempSF
    |> List.map (fun f -> Math.Round(f));;
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
* Map is always `$ O(n) $`

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

List.fold (fun a b -> a+1) 0 list
//val it : int = 6
```
<!-- .element: class="fragment"  data-fragment-index="3" -->

Translate to <!-- .element: class="fragment"  data-fragment-index="4" -->

f (f (f (f (f (f (f 0 1) 2) 3) 4) 4) 5) <!-- .element: class="fragment"  data-fragment-index="4" -->


----

### A better fold example

Insertion sort defined by List.fold

```fsharp
List.fold (fun a i ->
  let (f, b) = span (fun e -> e < i) a
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
 List.zip [1;2;3;4] [2;4;6;8];;
val it : (int * int) list = [(1, 2); (2, 4); (3, 6); (4, 8)]

> List.zip [1;2;3;4] [2;4;6;8;2];;
System.ArgumentException: The lists had different lengths.
list1 is 1 element shorter than list2 (Parameter 'list1')
Stopped due to error

```

---

## Set

* Finite
* Only elements where `ordering` is defined
* Elements are unique
* Internally represented as a `BBT`
* Immutable
    * All operations returns a new `set`
* Mathmatical set operations available

Note:
BST: balanced binary three

----

### Set creations

```
set [1;2;3;4;5]

Set.ofList [1;2;3;4;5]

Set.add 6 (set [1;2;3;4;5])

Set.remove 3 (set [1;2;3;4;5])
```

----


### Union + Intersection + Difference

Definition

```fsharp
union:      Set<'a> -> Set<'a> -> Set<'a>
intersect:  Set<'a> -> Set<'a> -> Set<'a>
difference: Set<'a> -> Set<'a> -> Set<'a>
```

----

### Examples

```fsharp
let first = set ["a"; "b"]
let second = set ["c"; "d"]
let third = set ["a"; "d"]

Set.union first second
// val it : Set<string> = set ["a"; "b"; "c"; "d"]
Set.intersect first third
// val it : Set<string> = set ["a"]
Set.difference first third
// val it : Set<string> = set ["b"]
```

----

## Sets in general

* `map`, `filter`, `fold`, `foldBack` are all `$ O(n) $`
* complexity of recusion is in worst case `$ O(n*log(n)) $`
* Enumarations can be used to simplify and optimize this

---

## Maps

* Key / value pair
* Key is unique
* Look per key
* Immutable
* Implemented using `BBT`
* As Set requires ordering is defined for key type

Note:
BST: balanced binary three

----

### Creations

Creation is straightforward

```fsharp
// From list
Map.ofList [("k1", 1); ("k2", 2); ("k3", 3), ("k3", 4)]
// val it : Map<string,int> =
//     map [("k1", 1); ("k2", 2); ("k3", 4)]

Map.add "k5" 5 it

Map.remove "k1" it
```

----

### Search

```
find:        'a -> Map<'a, 'b> -> 'b
tryFind:     'a -> Map<'a, 'b> -> 'b option
containsKey: 'a -> Map<'a, 'b> -> bool
```

should we try?

----

### fold and foldBack on Maps

Definition for fold, foldBack on map takes key/value pair into account

```
fold:     ('a -> 'b -> 'c -> 'a) -> 'a -> Map<'b, 'c> -> 'a
foldBack: ('a -> 'b -> 'c -> 'c) -> Map<'a, b'> -> 'c -> 'c
```

```fsharp
let m = Map.ofList [("k1", 1); ("k2", 2);
                    ("k3", 4); ("k5", 5)]
Map.fold (fun a b c -> a + c) 0 m
// val it : int = 12
```
<!-- .element: class="fragment" -->

---

## Equality

* `=` operator is defined for both list, set and map
* Equal is consists of same elements
    * List also consider order of elements

```fsharp
[1;2] = [1;2]
// val it : bool = true

[1;2] = [2;1]
// val it : bool = false

set [1;2] = set [1;2]
// val it : bool = true

set [1;2] = set [3;2]
// val it : bool = false
```

---

## References

* Complexity for F# datastructures: https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/fsharp-collection-types