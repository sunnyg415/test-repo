# AJAX Remote Forms

Using AJAX, let's write a form that, when the user clicks the
"submit" button, will submit the form data in the background.

The key is the jQuery [`serialize`] [jquery-serialize-doc] method. If
you have a jQuery wrapped form element, you can call the `serialize`
method, which will extract the values from the `input` tags contained
in the `form`, and then serialize these to URL encoding. As you know,
URL encoding is the format that form data is uploaded in.

Let's see it go!

```html
<!-- notice how we don't set the action/method on the form tag -->
<form id="cat-form">
  <input type="text" name="cat[name]">
  <input type="text" name="cat[color]">

  <input type="submit">
</form>

<script>
  $("#cat-form").on("submit", event => {
      // Lookup `preventDefault`; it stops the browser's default action,
      // which is to make a synchronous submission of the form.
      // http://api.jquery.com/category/events/event-object
      event.preventDefault();

      // As a shortcut, when jQuery calls your event handler, it sets
      // `this == event.currentTarget`.

      var formData = $(event.currentTarget).serialize();

      // If you filled out name "Gizmo" and color "Black", then
      // `formData == "cat%5Bname%5D=Gizmo&cat%5Bcolor%5D=Black"`.

      $.ajax({
        url: "/cats",
        type: "POST",
        data: formData,
        success() {
          console.log("Your callback here!");
        }
      });
    }
  );
</script>
```

[jquery-serialize-doc]: http://api.jquery.com/serialize

### Getting input values in JS `Object` format

It's great to get a URL encoded representation of the input values,
but it's also a little frustrating. URL encoding is difficult for us
to manipulate on the client side; just about the only thing we can do
with it is submit it to the server.

One possibility is to use the
[serializeJSON][serializeJSON] jQuery plug-in. It creates a JavaScript
object following the Rails parameter conventions.

You can get Rails to automatically load the serializeJSON plugin by
including the [serialize_json-rails][serializeJSON-rails] gem:

```ruby
gem 'serialize_json-rails'
```

and then load the file (after jQuery) in app/assets/javascripts/application.js:

```js
//= require serialize_json
```

[serializeJSON]: https://github.com/marioizquierdo/jquery.serializeJSON
[serializeJSON-rails]: https://github.com/travisR004/serialize_json-rails

## Authenticity token

What about the authenticity token? Rails will automatically include a
JavaScript library named `rails.js` in your `application.js`
file. Among a number of other things, this will install a
`$.ajaxPrefilter`; this filter gets run before every AJAX request.

The filter ([`rails.CSRFProtection`][rails-csrf-protection]), will
look up the CSRF token (which Rails stores in a `meta` element in the
`head`), and add this as a header to send with the request.

Should you ever explicitly need the CSRF token, you can do what
`rails.js` does to look it up:

```js
    $('meta[name="csrf-token"]').attr('content');
```

[rails-csrf-protection]: https://github.com/rails/jquery-ujs/blob/master/src/rails.js#L55
