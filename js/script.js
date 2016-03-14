
//http://api.giphy.com/v1/gifs/feqkVgjJpYtjy?api_key=dc6zaTOxFJmzC
///v1/gifs/<gif_id>

// models ====================
var IphyModel = Backbone.Model.extend({
   defaults: {
       description: "no description provided",
       image_type: "gif"
   },

   url: "",
   _apiKey: "dc6zaTOxFJmzC",

   _generate_URL: function (id) {
      var fullURL = "http://api.giphy.com/v1/gifs/" + id 
      this.url = fullURL
   },

  parse: function(JSONData){ //parse backbone magic 
       if (JSONData.data) return JSONData.data //this is the case when IphyModel is fetching
       else return JSONData //this the case when one of many in the collection
   }
})

var IphyCollection = Backbone.Collection.extend({
   url: "http://api.giphy.com/v1/gifs/search?",
   _apiKey: "dc6zaTOxFJmzC",
   model: IphyModel,
   parse: function(JSONData){ //parse backbone magic 
       return JSONData.data //will filter data wanted 
   }
})

//Views ====================
var IphyDetailView = Backbone.View.extend ({
  el: "#container",

  initialize: function(someModel){
       this.model = someModel 
       var newFunc = this._render.bind(this)
       this.model.on("sync",newFunc)
   },

  _render: function(){
    console.log(this.model)
    var newHtmlString = '<img src="' + this.model.get('images').original.url + '">'
    this.el.innerHTML = newHtmlString
  }

})
var IphyScrollView = Backbone.View.extend ({
   el: "#container",

   initialize: function(collection){
       this.collection = collection
       var newFunc = this._render.bind(this)
       this.collection.on("sync",newFunc)
   },

   events: {
       "click img.gifScroll": "_triggerDetailView"
   },

   _triggerDetailView: function(clickEvent) {
       var imgNode = clickEvent.target
       location.hash = "detail/" + imgNode.getAttribute("gifid")
   },

   _render: function(){
       console.log(this.collection)
       var dataArray = this.collection.models
       var gifUrlString = ""
       // console.log(dataArray[0])
       for (var i = 0; i < dataArray.length; i++) {
           var gifObj = dataArray[i]
           // console.log(gifObj.images.original.url)
           gifUrlString += '<img gifid="' + gifObj.get('id') + '" class="gifScroll" src="' + gifObj.get('images').original.url + '">'
       }
       this.el.innerHTML = gifUrlString
   }

})


// routes ====================
var IphyRouter = Backbone.Router.extend ({

   routes: {
       "scroll/:query": "handleScrollView", // whatever is after the (/) will be stored as a query varable by using this (:)
       "detail/:id": "handleDetailView"
   },

   handleScrollView: function(query){
       var colleccion = new IphyCollection()
       var nv = new IphyScrollView(colleccion)
       colleccion.fetch({  //fetch is implementing a json promise, will also trigger sync event. 
           // dataType:"jsonp",
           data:{
               q:query,
               api_key: colleccion._apiKey
               // callback:"?" //same as jsonp
           }
       })

       // colleccion.where({image_type:"gif"}) //used to filter according to atributes. 
   },


   handleDetailView: function(id) {
      var dm = new IphyModel()
      dm._generate_URL(id)
      var dv = new IphyDetailView(dm)
      dm.fetch({
        data: {
          api_key: dm._apiKey
        }

      })

   },


   initialize: function(){
       Backbone.history.start()
   }

})

var rtr = new IphyRouter()