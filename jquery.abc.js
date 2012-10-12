(function($){

	var methods = {

		init : function(options){

			options || (options = {}); //options passed?

					/* OPTIONS */
				var settings = $.extend({

					letters : 'Bxm-.', //letters used, dark to light
					invert : false //invert the letters if light text is used on a dark background

			}, options);

			return this.each(function(){

				var letters = settings.letters.split('');

				if (settings.invert){

					letters.reverse();

				}

				var colors = [];

				for (var a = 0; a < letters.length; a++){

					colors.push({

						top: 255 / letters.length * (a + 1),
						bottom: 255 / letters.length * a,
						letter: letters[a]
						
					});

				};

				var dummy = $('<span>').text('a').css('font-family','monospace');
				$('body').append(dummy);

				var charSize = {
					x : dummy.width(),
					y : dummy.height()
				};

				var $img = $(this);
				var dimensions = {
					width: $img.width(),
					height: $img.height()
				};

				dummy.remove();

				var blocks = {

					x : ~~(dimensions.width / charSize.x),
					y : ~~(dimensions.height / charSize.y)

				}

				var pic = $('<canvas>', {class: 'ascii-picture'}).attr(dimensions).hide();

				var picCtx = pic[0].getContext('2d');

				var text = $('<div>', {class : "ascii-text"}).css('font-family','monospace').css(dimensions);

				$img.hide().wrap($('<span>',{class : 'ascii-wrapper'}).css('display' , 'inline-block')).after(pic, text);

				picCtx.drawImage($img[0], 0, 0, dimensions.width, dimensions.height);

				var pixelArray = picCtx.getImageData(0, 0, dimensions.width, dimensions.height).data;
				var blockArray = [];

				for (var h = 0; h < blocks.y; h++){ //move along y

					for (var i = 0; i < blocks.x; i++){ //move along x

							var pixelsInBlock = [];
							var baseOffset = h * charSize.y * dimensions.width * 4 + i * charSize.x * 4;

							for (var j = 0; j < charSize.y; j++){

								for (var k = 0; k < charSize.x; k++){
									
									var currentOffset = baseOffset + (j * dimensions.width * 4 + k * 4);

									var weight = (pixelArray[currentOffset] + pixelArray[currentOffset + 1] + pixelArray[currentOffset + 2]) / 3;

									pixelsInBlock.push(weight);

								}

							}

							blockArray.push(~~(pixelsInBlock.reduce(function(a,b){return a + b;}) / (charSize.x * charSize.y)));

						}

					}


				for (var l = 0; l < blocks.y; l++){

					for (var m = 0; m < blocks.x; m++){

						text.html(function(){

							var letter;

							$.each(colors, function(){

								if (blockArray[0] < this.top && blockArray[0] >= this.bottom){

									letter = this.letter;
									return false;

									}

								});

								return $(this).html() + letter;
							});

							blockArray.shift();

						}

						text.html(function(){
							return $(this).html() + '<br>';
						});

				}


			});

		},

		undo : function(){

			return this.each(function(){

				$(this).show().next('.ascii-picture').remove().end().next('.ascii-text').remove().end().unwrap();

			});

		} 

	};


	$.fn.abc = function(method) {

		if (methods[method]) {

			return methods[method].apply(this, [].slice.call(arguments, 1));

		} else if ( typeof method === 'object' || ! method ) {

			return methods.init.apply( this, arguments );

		} else {

			$.error( 'Method ' +  method + ' does not exist on jQuery.abc' );

		}

	};

})(jQuery);