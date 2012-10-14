/* jQuery abc WIP - turn images into ASCII art - written by Frederik Ring (frederik.ring@gmail.com) */

/* Copyright (c) 2012 Frederik Ring */
/* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: */
/* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. */
/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

/* see https://github.com/m90/jquery.abc for documentation */

(function($){

	var methods = {

		init : function(options){

			options || (options = {}); //options passed?

					/* OPTIONS */
				var settings = $.extend({

					letters : 'XMI/-.', //letters used, dark to light
					invert : false //invert the letters if light text is used on a dark background

			}, options);

			return this.each(function(){

				if (this.nodeName === 'IMG'){

					var
					$img = $(this),
					letters = settings.invert ? settings.letters.split('').reverse() : settings.letters.split(''),
					colors = [],
					dimensions = {
					
						width: $img.width(),
						height: $img.height()
					
					};

					for (var a = 0; a < letters.length; a++){

						colors.push({

							top: 255 / letters.length * (a + 1),
							bottom: 255 / letters.length * a,
							letter: letters[a]
							
						});

					};

					var dummy = $('<span>').text('a').css({'font-family' : 'monospace', 'visibility' : 'hidden'});
					$('body').append(dummy);
					
					var charSize = {
						x : dummy.width(),
						y : dummy.height()
					};

					dummy.remove();
					
					var blocks = {

						x : ~~(dimensions.width / charSize.x),
						y : ~~(dimensions.height / charSize.y)

					},
					pic = $('<canvas>', {class: 'abc-picture'}).attr(dimensions).hide(),
					picCtx = pic[0].getContext('2d');

					$img.hide().wrap($('<span>', {class : 'abc-wrapper'}).css('display' , 'inline-block')).after(pic);

					picCtx.drawImage($img[0], 0, 0, dimensions.width, dimensions.height);

					var pixelArray = picCtx.getImageData(0, 0, dimensions.width, dimensions.height).data;

					pic.remove();

					var blockArray = [];

					for (var h = 0; h < blocks.y; h++){ //move along y at block level

						for (var i = 0; i < blocks.x; i++){ //move along x at block level

								var pixelsInBlock = [];
								var baseOffset = h * charSize.y * dimensions.width * 4 + i * charSize.x * 4;

								for (var j = 0; j < charSize.y; j++){ //move along y at pixel level

									for (var k = 0; k < charSize.x; k++){ //move along x at pixel level
										
										var currentOffset = baseOffset + (j * dimensions.width * 4 + k * 4);

										var weight = (pixelArray[currentOffset] + pixelArray[currentOffset + 1] + pixelArray[currentOffset + 2]) / 3;

										pixelsInBlock.push(weight);

									}

								}

								blockArray.push(~~(pixelsInBlock.reduce(function(a,b){return a + b;}) / (charSize.x * charSize.y)));

							}

						}

					
					var letters = [];

					for (var l = 0; l < blocks.y; l++){

						for (var m = 0; m < blocks.x; m++){

								$.each(colors, function(){

									if (blockArray[0] <= this.top && blockArray[0] >= this.bottom){

										letters.push(this.letter);
										return false;

									}

								});

								blockArray.shift();

							}

							letters.push('\n');

					}

					var art = '<pre>' + letters.join('') + '</pre>';
					$img.after(art);


				} else {

					$.error('.abc() can only be applied to image elements!');

				}

			});

		},

		undo : function(){

			return this.each(function(){

				$(this).show().next('pre').remove().end().unwrap();

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