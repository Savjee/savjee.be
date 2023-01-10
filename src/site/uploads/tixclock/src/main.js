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
 * Function that adds leading zero's to a givin number
 */
function pad(number, length) {
	let str = '' + number;

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
	let arr_colored = [];

	while( arr_colored.length != amount ){

		let num = random_number(0, arr_leds[group]);

		if(arr_colored.find(el => el === num) === undefined){

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

	for(let i=0; i<=elements.length-1; i++){
		if(elements[i].className == 'active'){
			elements[i].className = '';
		}
	}
}

/**
 * Function to update the time of the pixClock
 */
function updateTime(){
	var currentTime = new Date();

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
