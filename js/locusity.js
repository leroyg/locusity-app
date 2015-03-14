;(function(exports) {
	'use strict';

	Backbone.LocusityRouter = Backbone.Router.extend({
		initialize: function() {
			var self = this;
			this.left = document.querySelector('.left-content');
			this.right = document.querySelector('.right-content');
			this.username = document.querySelector('.username');
			this.meetups = document.querySelector('.meetups');
			// this.point;


			this.infoSide = z(Backbone.FixedSide);
			// this.chatSide = z(Backbone.ChooseUserName);
			React.render(this.infoSide, this.left);
			// React.render(this.chatSide, this.right);

			this.getLocation().then(function(d) {
				this.point = d
				console.log(this.point)
				this.collection = new Backbone.Meetups()
				this.collection.latitude = this.point.latitude;
				this.collection.longitude = this.point.longitude;
				// debugger;
				this.collection.fetch().then(function() {
					this.chatSide = z(Backbone.ChooseUserName);
					React.render(this.chatSide, this.username);
				}.bind(this))
			}.bind(this))


			/*var pubnub = PUBNUB.init({
	            publish_key: 'insert-here',
	            subscribe_key: 'insert-here'
         	});			

			pubnub.time(
			    function(time) {
			        console.log(time)
			    }
			);

			pubnub.subscribe({
			    channel: 'my_channel',
			    message: function(m) {
			        console.log(m)
			    }
			});*/

			Backbone.history.start();
		},
		routes: {
			'chat': 'chatroom',
			'*default': 'home'
		},
		home: function() {
			console.log('this is the home route');
		},
		chatroom: function() {
			//configure a block so they can't come straight here UNLESS they have a session already
			this.meetupView = z(Backbone.MeetupsView, {collection: this.collection});
			React.render(this.meetupView, this.meetups);
			$('.meetups').show()
		},
		getLocation: function() {
			var deferred = new $.Deferred()
			function success(pos) {
				// console.log(pos.coords.latitude + ", " + pos.coords.longitude);
				deferred.resolve({latitude: pos.coords.latitude, longitude: pos.coords.longitude});
			}
			function fail(error) {
				console.log(error.code + ': uh oh, that\'s not good');
			}

			navigator.geolocation.getCurrentPosition(success, fail);
			return deferred.promise();
		}
	});

	Backbone.aMeetup = Backbone.Model.extend({
		// url: function() {
		// 	return ['https://api.meetup.com/2/event/',
		// 	this.collection.id,
		// 	'?&sign=true&format=json&photo-host=public&page=1&',
		// 	'key=INSERT-HERE'].join('');
		// }
	});

	Backbone.Meetups = Backbone.Collection.extend({
		model: Backbone.aMeetup,
		url: function() {
			// return ['https://api.meetup.com/2/open_events?&sign=true&format=json&photo-host=public&',
			// 'lat='+ this.latitude,
			// '&topic=javascript,coding,ruby&',
			// 'lon='+ this.longitude,
			// '&time=,2w&radius=35&page=10&',
			// 'key=INSERT-HERE'].join('')
			return ['https://jsonp.nodejitsu.com/?url=https%3A%2F%2Fapi.meetup.com',
			'%2F2%2Fopen_events%3F%26sign%3Dtrue%26format%3Djson%26photo-host%3Dpublic%',
			'26lat%3D',this.latitude,
			'%26topic%3Djavascript%2Ccoding%2Cruby%26',
			'lon%3D',this.longitude,
			'%26time%3D%2C2w%26radius%3D35%26page%3D10%26',
			'key%3DINSERT-HERE'].join('');
		},
		parse: function(data) {
			return data.results;
		}
	});

	Backbone.Header = React.createClass({
		displayName: 'Header',
		render: function() {
			return z('header', [
					z('div.title', [
						z('h1', 'Locusity'),
						z('h6', 'Connect with those around you')
					])
				])
		}
	});

	Backbone.StaticContent = React.createClass({
		displayName: 'StaticContent',
		render: function() {
			var lorem = 'why can\'t i use lorem ipsom whatever whatever? it doesn\'t make any sense'+
				'i cannot deal with these right now Lorem ipsum dolor sit amet, consectetur' +
				'adipisicing elit, sed do eiusmod tempor incididunt ut labore et' +
				'dolore magna aliqua. Ut enim ad minim veniam';
			return z('div.static-wrapper', [
				z('span', 'should probably add a svg img there of a laptop or something'),
				z('div.info', lorem)
			])
		}
	});

	Backbone.Footer = React.createClass({
		displayName: 'Footer',
		render: function() {
			return z('nav', [
					z('ul', [
						z('li.about', 'Social Buttons'),
						z('li.contact', 'Contact'),
						z('li.techs', 'Tech Used')
					])
				])
		}
	});

	/*main view for the LEFT side*/
	Backbone.FixedSide = React.createClass({
		displayName: 'FixedSide',
		render: function() {
			return z('div.left-side', [
				z(Backbone.Header),
				z(Backbone.StaticContent),
				z(Backbone.Footer)
			])
		}
	});

	Backbone.ContentSide = React.createClass({
		displayName: 'ContentSide',
		render: function() {
			return z('div.content-side', [
				z(Backbone.ChooseUserName),
				/* Meetup API stuff here */])
		}
	})

	Backbone.ChooseUserName = React.createClass({
		displayName: 'ChooseUserName',
		_getUserName: function(e) {
			e.preventDefault();
			var name = React.findDOMNode(this.refs.username).value; //might need to store this username within the 'global' Backbone
			var form = document.querySelector('.username'); 
			// alert('hello ' + name + "!");
			// $('.username').addClass('disappear');
			$('.username').hide();
			window.location.hash = '#chat'
		},
		render: function() {
			return z('div.form-wrapper', [
				z('form.username', {onSubmit: this._getUserName}, [
					//need to regex
					z('input:text[required][placeholder=Choose a Username]@username'),
					z('button', 'START!')
				])
			])
		}
	})

	Backbone.MeetupsView = React.createClass({
		displayName: 'MeetupsView',
		// getInitialState: function() {
  //           return {}
  //       },
  //       getDefaultProps: function() {
  //           return {
  //               collection: null
  //           };
  //       },
  //       componentWillMount: function() { //what happens when the object is attached to the dom similar to initialize
  //           var self = this;
  //           this.props.collection && this.props.collection.on("change reset add remove", function() {
  //               self.forceUpdate() //setup listener and then force update on collection change
  //           })
  //       },
		render: function() {
			console.log(this.props);
			// debugger;
			var each = this.props.collection.models;
			return z('div.meets', 
				each.map(function(data) {
					return z('div.meetupinstance', {key: data.get('id')}, data.get('id'))
				})
			)
		}
	})


})(typeof module === 'object' ? module.exports: window);