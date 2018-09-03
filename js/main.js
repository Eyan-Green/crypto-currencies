// API and default currency
const url = "https://min-api.cryptocompare.com/data/price?fsym=";
const currency = "BTC - Bitcoin";
const params = "&tsyms=USD,GBP,EUR,AUD,CAD";
const historyBaseUrl = "https://min-api.cryptocompare.com/data/histoday?fsym=";
const historyParams = "&tsym=";
const historyFiat = "GBP";
const historyParamsTwo = "&limit=";
const historyDays = "7"

// creates currency symbols array
const getSymbols = () => {
	const coinSymbols = ["BTC - Bitcoin", "ETH - Ethereum", "LTC - Litecoin", "XRP - Ripple",
	 "TRX - Tron", "XMR - Monero", "BCH - BitcoinCash", "EOS - EOS", "ADA - Cardano", "XLM - Stellar",
	  "NEO - NEO", "DASH - Dash", "ZEC - Zcash", "NANO - Nano", "LSK - Lisk", "QTUM - Qtum", "BNB - Binance"];
	populateSelect(coinSymbols.sort());
}
// creates array of days
const getDays = () => {
	const days = [7, 14, 30];
	populateSelectDays(days);
}
// creates array of FIAT symbols
const getFiatSymbols = () => {
	const symbols = ["GBP", "EUR", "USD", "CAD", "AUD", "COP"];
	populateSelectCurrency(symbols);
}

// Populates select tag with days
const populateSelectCurrency = (currencies) => {
	// Get dropdown element from DOM
	const dropdown = document.getElementById("selectFiatCurrency");
	// Loop through the array
	for (let i = 0; i < currencies.length; ++i) {
	    // Append the element to the end of Array list
	    dropdown[dropdown.length] = new Option(currencies[i], currencies[i]);
	}
}
// Populates select tag with days
const populateSelectDays = (days) => {
	// Get dropdown element from DOM
	const dropdown = document.getElementById("selectDays");
	// Loop through the array
	for (let i = 0; i < days.length; ++i) {
	    // Append the element to the end of Array list
	    dropdown[dropdown.length] = new Option(days[i], days[i]);
	}
}

// Populates select tag with currency codes
const populateSelect = (data) => {
	// Get dropdown element from DOM
	const dropdown = document.getElementById("selectCoin");
	// Loop through the array
	for (let i = 0; i < data.length; ++i) {
	    // Append the element to the end of Array list
	    dropdown[dropdown.length] = new Option(data[i], data[i]);
	}
}
// Collects data from API for bar chart
const loadChartData = (currency) => {
	fetch(`${url}${currency}${params}`, {
		method: 'GET'
	})
	.then(response => response.json())
	.then(response => {
		let usd = response.USD;
		let euro = response.EUR;
		let gbp = response.GBP;
		let cad = response.CAD;
		let aud = response.AUD;
		loadChart("#chart",usd, euro, gbp, cad, aud, currency);
	})
}
// Populates bar chart with data 
const loadChart = (div, dollar, euro, gbp, cad, aud, currency) => {
	let chart = c3.generate({
		bindto: div,
		data: {
			columns: [
				['Pound', gbp]
			],
			type: 'bar'
		},
		bar: {
			width: {
				ratio: 0.5
			}
		},
		tooltip: {
		  	format: {
		    	title: () => { return `${currency}`; }
		  	}
		}
	});
	setTimeout(function () {
	    chart.load({
	        columns: [
				['Euro', euro]
	        ]
	    });
	}, 250);
	setTimeout(function () {
	    chart.load({
	        columns: [
				['USD', dollar]
	        ]
	    });
	}, 500);
	setTimeout(function () {
	    chart.load({
	        columns: [
				['CAD', cad]
	        ]
	    });
	}, 750);
	setTimeout(function () {
	    chart.load({
	        columns: [
				['AUD', aud]
	        ]
	    });
	}, 1000);
}
// collects data from API for line chart
const loadLineChartData = (coin, fiat, days) => {
	fetch(`${historyBaseUrl}${coin}${historyParams}${fiat}${historyParamsTwo}${days}`, {
		method: 'GET'
	})
	.then(response => response.json())
	.then(response => {
	let lows = [];
	let highs = [];
	let sum = [];
	let dates = [];
		for (let i = 0; i < response.Data.length; i++ ) {
			lows.push(response.Data[i].low);
			highs.push(response.Data[i].high);
			sum.push(response.Data[i].low + response.Data[i].high)
			dates.push(moment.unix(response.Data[i].time).format("DD-MM"))
		}
		let avg = sum.map(i => (i.toFixed(4) / 2));
		loadLineChart("#lineChart", lows, highs, avg, coin, dates);
	})
}
// populates line chart
const loadLineChart = (div ,lows, highs, avg, coin, dates) => {
	lowArray = ['Low']
	averageArray = ['Average']
	highArray = ['High']
	for (let i = 0; i < lows.length; i++) {
		lowArray.push(lows[i])
		averageArray.push(avg[i])
		highArray.push(highs[i])
	}
	let chart = c3.generate({
		bindto: div,
	    data: {
	        columns: [
	            lowArray,
	            averageArray,
	            highArray
	        ]
	    },
	    oninit: function () {
        this.main.append('rect')
            .style('fill', 'white')
            .attr('x', 0.5)
            .attr('y', -0.5)
            .attr('width', this.width)
            .attr('height', this.height)
          	.transition().duration(1000)
            .attr('x', this.width)
            .attr('width', 0)
          	.remove();
	    },
	    axis: {
	        x: {
	            type: 'category',
	            categories: dates
	        }
	    },
		tooltip: {
		  	format: {
		    	title: () => { return `${coin}`; }
		  	}
		}
	})
}
// event listeners to populate charts when crypto currency is changed.
document.getElementById('selectCoin').addEventListener('change', () => {
	const selectDay = document.querySelector('#selectDays').value;
  	const selectCoin = document.querySelector('#selectCoin').value;
  	const selectFiat = document.querySelector('#selectFiatCurrency').value;
  	
  	if (selectCoin !== "Select Coin") {
	  	document.getElementById('coinHeader').innerHTML = `${selectCoin.split(" ")[2]}`;
		document.getElementById('averageHeader').innerHTML = `${selectCoin.split(" ")[0]} ${selectDay} day High/Low.`;
		loadLineChartData(selectCoin.split(" ")[0], selectFiat, selectDay);
	  	loadChartData(selectCoin.split(" ")[0]);
	}  
});
// event listener to change line chart when days dropdown is changed.
document.getElementById('selectDays').addEventListener('change', () => {
	const selectDay = document.querySelector('#selectDays').value;
	const selectCoin = document.querySelector('#selectCoin').value;
	const selectFiat = document.querySelector('#selectFiatCurrency').value;
  	
  	if (selectCoin !== "Select Coin"){
		document.getElementById('averageHeader').innerHTML = `${selectCoin.split(" ")[0]} ${selectDay} day High/Low.`;
		loadLineChartData(selectCoin.split(" ")[0], selectFiat, selectDay);
	} else {
		document.getElementById('averageHeader').innerHTML = `${currency.split(" ")[0]} ${selectDay} day High/Low.`;
		loadLineChartData(currency.split(" ")[0], selectFiat, selectDay);
	}
});
// event listener to change line chart when fiat currency dropdown is changed.
document.getElementById('selectFiatCurrency').addEventListener('change', () => {
	const selectDay = document.querySelector('#selectDays').value;
	const selectCoin = document.querySelector('#selectCoin').value;
	const selectFiat = document.querySelector('#selectFiatCurrency').value;
  	
  	if (selectCoin !== "Select Coin"){
		document.getElementById('averageHeader').innerHTML = `${selectCoin.split(" ")[0]} ${selectDay} day High/Low.`;
		loadLineChartData(selectCoin.split(" ")[0], selectFiat, selectDay);
	} else {
		document.getElementById('averageHeader').innerHTML = `${currency.split(" ")[0]} ${selectDay} day High/Low.`;
		loadLineChartData(currency.split(" ")[0], selectFiat, selectDay);
	}
});

// populates h2 tag on load
document.getElementById('coinHeader').innerHTML = `${currency.split(" ")[2]}`;
document.getElementById('averageHeader').innerHTML = `${currency.split(" ")[0]} 7 day High/Low.`;

// callbacks 
getSymbols();
getDays();
getFiatSymbols();
loadChartData(currency.split(" ")[0]);
loadLineChartData(currency.split(" ")[0], historyFiat, historyDays);