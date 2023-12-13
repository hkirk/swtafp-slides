<!-- .slide: data-background="#003d73" -->
## Functional error handling 

![AU Logo](./../img/aulogo_uk_var2_white.png "AU Logo") <!-- .element style="width: 200px; position: fixed; bottom: 50px; left: 50px" -->

---

```csharp

public interface IDisposable {
    public void Dispose();
}

using(var db = new SQLConnection("sadf")) {
    db.Query("dsaf");

    ...
}


```