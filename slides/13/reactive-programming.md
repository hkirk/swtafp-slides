<!-- .slide: data-background="#003d73" -->

## Reactive programming

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

---


### Reactive programming

* Declarative paradigm
    * responding to events
* Imparative vs declarative

```[1-3|4-8]
// Imparative
let a = b + c
// a is assigned and never changed
// Reactive
let a' = b + c
b <- 'new_value'
// a is now recombuted
```
<!-- .element: class="fragment" -->

----

### Reactive programming

* ReactiveX
    * RXjs (used in Angular, ..)
    * Rx.NET
    * RxJava
    * ...

----

### When to use

* Emitting and consuming events are async<br/><!-- .element: class="fragment" -->
* Events are async<br/><!-- .element: class="fragment" -->
* Events vs Reactive programming<br/><!-- .element: class="fragment" -->
    * robustness
    * extend
* Learing curve<br/><!-- .element: class="fragment" -->

---

### Creating events

```fsharp [1-11|12-15]
let createTimer timerInterval eventHandler =
    let timer = new System.Timers.Timer(float timerInterval)
    timer.AutoReset <- true

    timer.Elapsed.Add eventHandler

    async {
        timer.Start()
        do! Async.Sleep 5000
        timer.Stop()
    }
// call createTimer
let basicHandler _ = printfn "tick1 %A" DateTime.Now
let basicTimer1 = createTimer 1000 basicHandler
Async.RunSynchronously basicTimer1
```

----

### Using the built in Observable

```fsharp [1-13|14-21]
let createTimerAndObservable timerInterval =
    let timer = new System.Timers.Timer(float timerInterval)
    timer.AutoReset <- true

    let observable = timer.Elapsed

    let task = async {
        timer.Start()
        do! Async.Sleep 5000
        timer.Stop()
    }

    (task,observable)
// Calling from somewhere else
let basicTimer2, timerEventStream =
        createTimerAndObservable 1000
timerEventStream
|> Observable.subscribe //basicHandler
        (fun _ -> printfn "tick2 %A" DateTime.Now)
|> ignore // disposable not disposed 
Async.RunSynchronously basicTimer2
```

----

### Piping events

```fsharp
let timerCount2, timerEventStream = createTimerAndObservable 500
timerEventStream
|> Observable.scan (fun count _ -> count + 1) 0
|> Observable.subscribe (fun count -> printfn "1 timer ticked with count %i" count)
|> ignore // disposable not disposed 
```

----

### Merging events

![Live code](https://resources.jetbrains.com/storage/products/rider/img/meta/preview.png "" )

---

### References 

* [Observable](https://fsharp.github.io/fsharp-core-docs/reference/fsharp-control-observablemodule.html)
* [F# For fun and profits](https://fsharpforfunandprofit.com/posts/concurrency-reactive/)