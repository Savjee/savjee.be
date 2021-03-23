var arr_leds = [2, 8, 5, 8]; // amount of LEDs in each group

/**
 * Function that generates a random number between two values
 *
 * @param	integer		min
 * @param	integer		max
 */
function random_number (min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}


/**
 * Function that checks if a givin string is in the givin array
 *
 * @param	string	string
 * @param	array 	array
 * @return	bool
 */
function inArray(string, array){
	var output = false;

	for(i=0; i <= array.length; i++){
		if(string == array[i]){
			output = true;
		}
	}

	return output;
}


/**
 * Function that adds leading zero's to a givin number
 */
function pad(number, length) {
	var str = '' + number;

	while (str.length < length) {
		str = '0' + str;
	}

	return str;
}


/**
 * Function that colors a given amount of LEDs in a given group
 *
 * @param	integer		amount
 * @param	integer		group
 */
function colorLeds(amount, group){
	var arr_colored = [];

	while( arr_colored.length != amount ){

		var num = random_number(0, arr_leds[group]);

		if( !inArray(num, arr_colored) ){

			document.getElementById(group + '_' + num).className = 'active';

			arr_colored.push(num);
		}
	}
}


/**
 * Function that clears all active LEDs
 */
function clearLeds(){
	var elements = document.getElementsByTagName('div');

	for(i=0; i<=elements.length-1; i++){
		if(elements[i].className == 'active'){
			elements[i].className = '';
		}
	}
}

/**
 * Function to update the time of the pixClock
 */
function updateTime(){
	var currentTime = new Date()

	var hour = pad( currentTime.getHours(), 2);
	var minutes = pad( currentTime.getMinutes(), 2);

	var hour_1 = hour.substr(0,1);
	var hour_2 = hour.substr(1,2);

	var minute_1 = minutes.substr(0,1);
	var minute_2 = minutes.substr(1,2);

	colorLeds(hour_1, 0);
	colorLeds(hour_2, 1);
	colorLeds(minute_1, 2);
	colorLeds(minute_2, 3);
}

setInterval(function(){
	clearLeds();
	updateTime();
}, 4000);

// Google Analytics
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-21432611-1']);
_gaq.push(['_setDomainName', 'savjee.be']);
_gaq.push(['_trackPageview']);

(function() {
 var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
    ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
  })();