<!-- .slide: data-background="#003d73" -->
# Immutable data structures

![Imnutability](https://miro.medium.com/max/1400/1*RxkciPHQuFv-zcWMGImtsw.png "Source: https://medium.com/@ffloven/immutability-4c8e0077fe9a") <!-- .element: style="height: 300px; float: right; rigth: -140px; bottom: -230px" -->

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element: style="width: 200px; position: absolute; bottom: 50px; left: 50px" -->


----

## Agenda

* What, Why
* How
    * Binary Search Tree (Set / map)
* Sets
    * union, intersect & difference
* Maps
    * foldBack
* Sequence in F#

---

## What

* Mutating operations
    * should not change structure
    * instead opy
* Can share data between 'versions'

----

## Why

* Pros:
    * immutable is easier to reason about
    * automatically thread safe
    * easier to implement :)
* Cons:
    * slower?
    * uses more memory
    * harder to implement :)

---

## Binary search tree

![BST](./img/bst.png "Binary search tree") <!-- .element style="height: 500px;" -->

----

### Type

```fsharp
type BST<'a> =
  | Empty
  | Node of BST<'a> * 'a * BST<'a>
module BST =
    // Code for creating/adding etc.
```

##### Invariants
* An element `'a` in a Node 
    * is **greater** than all elements in left sub-tree
    * is **less** than all elements in right sub-tree

Note:
We could also use .fsi files to declare functions

----

### Operations

```fsharp
type empty<'a>    = unit -> BST<'a>
type insert<'a>   = 'a   -> BST<'a> -> BST<'a>
type remove<'a>   = 'a   -> BST<'a> -> BST<'a>
type contains<'a> = 'a   -> BST<'a> -> bool
```

Could be extended with
* `map`
* `filter`
* `fold`
* etc.

note:

Insert is also call 'cons' in list-like structures

----

### Implementing `contains x`

```fsharp
let rec contains (x: 'a) (n: BST<'a>) =
    if (n == Empty) then false
    else 
        if (x < n.elem) then contains x n.left
        else if (x > n.elem) then contains x n.right
        else true

```

----

### Implementing `insert`


* Algorithm:  ![BST](./img/bst.png "Binary search tree") <!-- .element: style="width: 250px; float: right" -->
    1. Use a variation of `contains` to find correct place to insert
    2. Copy nodes as we move down through the tree
* Example
    * Inserting 9

----

### Step 1 

![BST](./img/insert1.png "Binary search tree") <!-- .element style="height: 500px;" -->

----

### Step 2

![BST](./img/insert2.png "Binary search tree") <!-- .element style="height: 500px;" -->

----

### Step 3

![BST](./img/insert3.png "Binary search tree") <!-- .element style="height: 500px; float: right" -->

* **Notice:**
* Only copy a small part</br>of the tree
    * How much?
* Does it effect run-time</br> for `insert`




---

## `Set<'a>`

* From .NET F# lib
* **Invariant:** Elements are unique
* Finite
* Only elements where `ordering` is defined
* Internally represented as a `BBT<'a>`
* Immutable
    * All operations returns a new `set`
* Mathmatical set operations available

Note:
BBT: balanced binary three

Red-Black tree: [OKASAKI, C. (1999). Red-black trees in a functional setting. Journal of Functional Programming, 9(4), 471-477. doi:10.1017/S0956796899003494](https://www.cambridge.org/core/journals/journal-of-functional-programming/article/redblack-trees-in-a-functional-setting/62BC5EA75A2C95E3F6EE95AE3DADF0E5)

----

### Set Creations

```
let s1 = set [1;2;3;4;5]

let s2 = Set.ofList [1;2;3;4;5]

let s1' = Set.add 6 s1

let s1'' = Set.remove 3 s1
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

## `Map<'a>`

* From .NET F# lib
* **Invariant:** Keys are unique
    * Key / value pair
    * Lookup per key
* Immutable
* Implemented using `BBT<'a>`
* As Set, Map requires ordering is defined for key type

Note:
BBT: balanced binary three

----

### Map creations

Creation is straightforward

```fsharp
let m1 = Map.empty
// From list
let m2 = Map.ofList [("k1", 1); ("k2", 2); ("k3", 3),
                     ("k3", 4)]
// val m2 : Map<string,int> =
//     map [("k1", 1); ("k2", 2); ("k3", 4)]

let m2' = Map.add "k5" 5 m2

let m2'' = Map.remove "k1" m2
```

----

### Search

```fsharp
find:        'Key -> Map<'Key, 'T> -> 'T
tryFind:     'Key -> Map<'Key, 'T> -> 'T option
containsKey: 'Key -> Map<'Key, 'T> -> bool
exists:      ('Key - 'T -> bool) -> Map<'Key, 'T> -> bool
```

----

### fold and foldBack on Maps

Definition for fold, foldBack on map takes key/value pair into account

```fsharp
fold:     ('State -> 'Key -> 'T -> 'State)
                     -> 'State -> Map<'Key, 'T> -> 'State
foldBack: ('Key -> 'T -> 'State -> 'State)
                     -> Map<'Key, 'T> -> 'State -> 'State
```

```fsharp
let m = Map.ofList [("k1", 1); ("k2", 2);
                    ("k3", 4); ("k5", 5)]
Map.fold (fun s k v -> s + v) 0 m
// val it : int = 12
```
<!-- .element: class="fragment" -->

---

## Equality

* `=` operator is defined for both `list`, `set` and `map`
* Equal is consists of same elements (structural)
    * For `list` order of elements matters

```fsharp
[1;2] = [1;2]
// val it : bool = true

[1;2] = [2;1]
// val it : bool = false

set [1;2] = set [2;1]
// val it : bool = true

set [1;2] = set [3;2]
// val it : bool = false
```

---

<!-- .slide: data-background-image="./img/infinite.jpg" data-background-opacity="0.5" -->
## Sequence


----

### Lazy

* Sequences in F# are lazy
* Possibly infinite

```fsharp
// Create finite
seq [1;2;3;4;5]
// Create infinite
let nat = Seq.initInfinite (fun i -> i)
// [f 0; f 1; f 2; ...]
```

----

### Accessing

```fsharp
Seq.item 5 nat
// val it: int 5
```

* `Seq.item 5 nat` evaluates the 5th element, but not elements `0-4` and `6->...`
* Calling `Seq.item 5 nat` will evaluate the 5th element again

----

### Cache

```fsharp
// Seq.cache: seq<'a> -> seq<'a>
let cachedNat = Seq.cache nat
```

* Calling `Seq.item 5 cachedNat` will evaluate all elements from 0-5
* Calling again will not evalute elements 0-5 again

---

### Amortized bounds

* An extension to the Big-O notation from DOA
* Used to analysis average run time
    * Usually used when some operations are fast and other are slow

* C# List is an example, its worst case bounds
    * insert: `$ O(n) $` -- **why?**
    * lookup: `$ O(1) $`
    * delete: `$ O(1) $`

----

### C# List analysis over time

* `$ \rightarrow $` `n` insertions are `$ O(n^2) $` worst case
* You can make the amortized analysis that shows <!-- .element: class="fragment"  data-fragment-index="1" -->
    * `n` insertions are `$ O(2n) $` <!-- .element: class="fragment"  data-fragment-index="1" -->
    * So amortized bounds are `$ O(1) $` for all operations <!-- .element: class="fragment"  data-fragment-index="1" -->
* See references for detailed analysis<!-- .element: class="fragment"  data-fragment-index="1" -->

---

## References

* Complexity for F# datastructures: https://docs.microsoft.com/en-us/dotnet/fsharp/language-reference/fsharp-collection-types
* [Amortized analysis](https://www.cs.cornell.edu/courses/cs3110/2011sp/Lectures/lec20-amortized/amortized.htm)