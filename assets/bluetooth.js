  if (/Chrome\/(\d+\.\d+.\d+.\d+)/.test(navigator.userAgent)){
    // Let's log a warning if the sample is not supposed to execute on this
    // version of Chrome.
    if (53 > parseInt(RegExp.$1)) {
      ChromeSamples.setStatus('Warning! Keep in mind this sample has been tested with Chrome ' + 53 + '.');
    }
  }


  document.querySelector('form').addEventListener('submit', function(event) {
    event.stopPropagation();
    event.preventDefault();

    if (isWebBluetoothEnabled()) {
      ChromeSamples.clearLog();
      onButtonClick();
    }
  });



  var ChromeSamples = {
    log: function() {
      var line = Array.prototype.slice.call(arguments).map(function(argument) {
	return typeof argument === 'string' ? argument : JSON.stringify(argument);
      }).join(' ');

      document.querySelector('#log').textContent += line + '\n';
    },

    clearLog: function() {
      document.querySelector('#log').textContent = '';
    },

    setStatus: function(status) {
      document.querySelector('#status').textContent = status;
    },

    setContent: function(newContent) {
      var content = document.querySelector('#content');
      while(content.hasChildNodes()) {
	content.removeChild(content.lastChild);
      }
      content.appendChild(newContent);
    }
  };



  log = ChromeSamples.log;

  function isWebBluetoothEnabled() {
    if (navigator.bluetooth) {
      return true;
    } else {
      ChromeSamples.setStatus('Web Bluetooth API is not available.\n' +
	  'Please make sure the "Experimental Web Platform features" flag is enabled.');
      return false;
    }
  }







var myCharacteristic;

    function onButtonClick() {
  // Validate services UUID entered by user first.
  let optionalServices = document.querySelector('#optionalServices').value
    .split(/, ?/).map(s => s.startsWith('0x') ? parseInt(s) : s)
    .filter(s => s && BluetoothUUID.getService);

  log('Requesting any Bluetooth Device...');
  navigator.bluetooth.requestDevice({
   // filters: [...] <- Prefer filters to save energy & show relevant devices.
      filters: [{services: [parseInt("0x2A3D")]}],
      //acceptAllDevices: true,
      optionalServices: optionalServices})
  .then(device => {
    log('Connecting to GATT Server...');
    return device.gatt.connect();
  })
  .then(server => {
    // Note that we could also get all services that match a specific UUID by
    // passing it to getPrimaryServices().
    log('Getting Services...');
    return server.getPrimaryServices();
  })
  .then(services => {
    log('Getting Characteristics...');
    let queue = Promise.resolve();
    services.forEach(service => {
      queue = queue.then(_ => service.getCharacteristics(parseInt("0x2A3D")).then(characteristics => {
	log('> Service: ' + service.uuid);
	characteristics.forEach(characteristic => {
	//if (characteristic.uuid != parseInt("0x2A3D")){ log("NAH", characteristic.uuid); return}
	myCharacteristic = characteristic
	  log('>> Characteristic: ' + characteristic.uuid + ' ' +
	      getSupportedProperties(characteristic));
	});
	  return myCharacteristic.startNotifications().then(_ => {
	    log('> Notifications started');
	    myCharacteristic.addEventListener('characteristicvaluechanged',
		handleNotifications);
	  });
      }));
    });
    return queue;
  })
  .catch(error => {
    log('Argh! ' + error);
  });
}

/* Utils */

function getSupportedProperties(characteristic) {
  let supportedProperties = [];
  for (const p in characteristic.properties) {
    if (characteristic.properties[p] === true) {
      supportedProperties.push(p.toUpperCase());
    }
  }
  return '[' + supportedProperties.join(', ') + ']';
}

    function hex_to_ascii(str1)
     {
	    var hex  = str1.toString();
	    var str = '';
	    for (var n = 0; n < hex.length; n += 2) {
		    str += String.fromCharCode(parseInt(hex.substr(n, 2), 16));
	    }
	    return str;
     }

    function handleNotifications(event) {
      if(arreglo_mediciones.length == 0){
      window.setTimeout(function(){
      document.getElementById("current_refresh").innerHTML = "<b>Current tx rate: </b>" + arreglo_mediciones.length +  "Hz";
	arreglo_mediciones = [];
      }, 1000)
      }
      let value = event.target.value;
      let a = [];
      // Convert raw data bytes to hex values just for the sake of showing something.
      // In the "real" world, you'd use data.getUint8, data.getUint16 or even
      // TextDecoder to process raw data bytes.
      for (let i = 0; i < value.byteLength; i++) {
	a.push((value.getInt8(i).toString(16)).slice(-2));
      }

      //console.log(hex_to_ascii(a.join('')))

      var json = JSON.parse(hex_to_ascii(a.join('')));
      //console.log(json);
      for (var i = 0; i < json.length; i++){
	arreglo_mediciones.push(json[i]);
	drawAccFromJson(json[i]);
      }

      //arreglo_mediciones.push(json);
      //drawAccFromJson(json);

    }
