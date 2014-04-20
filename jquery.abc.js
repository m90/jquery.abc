/* jQuery abc WIP - turn images into ASCII art - written by Frederik Ring (frederik.ring@gmail.com) */

/* Copyright (c) 2012 Frederik Ring */
/* Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions: */
/* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software. */
/* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE. */

/* see https://github.com/m90/jquery.abc for documentation */

(function($){

	function _cpaToString(cpa, width, charSize, blocks, colors){

		var
		reducedPixelArray = []
		, blockArray = []
		, letters = [];

		//get rid of alpha and reduce RGB to a single average value
		for (var b = 0, c = cpa.length; b < c; b += 4){
			reducedPixelArray.push(Math.max(cpa[b], cpa[b + 1], cpa[b + 2]));
		}

		//this will contain one luminance value for each letter-block
		for (var h = 0; h < blocks.y; h++){ //move along y at block level

			for (var i = 0; i < blocks.x; i++){ //move along x at block level

				var pixelsInBlock = [];
				var baseOffset = h * charSize.y * width + i * charSize.x;

				for (var j = 0; j < charSize.y; j++){ //move along y at pixel level

					for (var k = 0; k < charSize.x; k++){ //move along x at pixel level

						var currentOffset = baseOffset + (j * width + k);
							pixelsInBlock.push(reducedPixelArray[currentOffset]);

						}

					}

				//average all pixels in the current block and push into blockArray
				blockArray.push(parseInt(pixelsInBlock.reduce(function(a,b){return a + b;}) / (charSize.x * charSize.y), 10));

			}

		}

		for (var l = 0, m = blockArray.length; l < m; l++){

			letters.push($.grep(colors, function(el){
				return (blockArray[0] <= el.top && blockArray[0] >= el.bottom);
			})[0].letter);

			blockArray.shift();

			if ((l + 1) % blocks.x === 0){

				letters.push('\n'); //append line break

			}

		}

		return letters.join('');

	}

	var methods = {

		init : function(options){

			var settings = $.extend({
				letters : 'XMI/-.', //letters used, dark to light
				invert : false, //invert the letters if light text is used on a dark background
				fps: 25
			}, options || {});

			return this.each(function(){

				var letters = settings.invert ? settings.letters.split('').reverse() : settings.letters.split(''),
				colors = [],
				dimensions = {
					width: $(this).width()
					, height: $(this).height()
				};

				for (var a = 0; a < letters.length; a++){
					colors.push({
						top: 255 / letters.length * (a + 1)
						, bottom: 255 / letters.length * a
						, letter: letters[a]
					});
				}

				//GET SIZE OF A SINGLE MONOSPACED CHARACTER
				var dummy = $('<span>').text('a').css({
					'font-family' : 'monospace'
					, 'visibility' : 'hidden'
				}).appendTo($(this).parent());

				var charSize = {
					x : dummy.width()
					, y : dummy.height()
				};

				dummy.remove();

				var blocks = {
					x : parseInt(dimensions.width / charSize.x, 10)
					, y : parseInt(dimensions.height / charSize.y, 10)
				};

				$(this).wrap($('<span>', {
					'class' : 'abc-wrapper'
					, 'width': dimensions.width
					, 'height': dimensions.height
				}).css({
					'display' : $(this).css('display')
					, 'overflow' : 'hidden'
				})).hide();

				if (this.nodeName === 'IMG'){ //IMAGE

					var
					$img = $(this)
					, pic = $('<canvas>').attr(dimensions)
					, picCtx = pic[0].getContext('2d')
					, pixelArray
					, art;

					picCtx.drawImage($img[0], 0, 0, dimensions.width, dimensions.height);

					pixelArray = picCtx.getImageData(0, 0, dimensions.width, dimensions.height).data;

					art = [
						'<pre style="line-height:'
						, charSize.y, 'px;">'
						, _cpaToString(pixelArray, dimensions.width, charSize, blocks, colors)
						, '</pre>'
					].join('');

					$img.after(art);

				} else if (this.nodeName === 'VIDEO'){ //VIDEO

					var
					$vid = $(this)
					, vid = $('<canvas>').attr(dimensions)
					, vidCtx = vid[0].getContext('2d')
					, videoInterval;

					$vid.after(['<pre style="line-height:', charSize.y, 'px;"></pre>'].join(''));

					videoInterval = setInterval(function(){

						vidCtx.clearRect(0, 0, dimensions.width, dimensions.height);
						vidCtx.drawImage($vid[0], 0, 0, dimensions.width, dimensions.height);

						var pixelArray = vidCtx.getImageData(0, 0, dimensions.width, dimensions.height).data;
						$vid.next('pre').text( _cpaToString(pixelArray, dimensions.width, charSize, blocks, colors));

					}, 1000 / settings.fps);

					$vid.data('abcInterval', videoInterval);

				} else {
					$.error('.abc() can only be applied to image and video elements!');
				}

			});

		},

		undo : function(){

			return this.each(function(){

				$(this).show().next('pre').remove().end().unwrap();

				if ($(this).data('abcInterval')){
					clearInterval($(this).data('abcInterval'));
				}

			});

		}

	};


	$.fn.abc = function(method){

		if (methods[method]) {
			return methods[method].apply(this, [].slice.call(arguments, 1));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.abc' );
		}

	};

})(jQuery);