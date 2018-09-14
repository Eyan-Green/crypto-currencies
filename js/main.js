// API and default currency
const url = "https://min-api.cryptocompare.com/data/price?fsym=";
const currency = "BTC - Bitcoin";
const params = "&tsyms=USD,GBP,EUR,AUD,CAD";
const historyBaseUrl = "https://min-api.cryptocompare.com/data/histoday?fsym=";
const exchanges = "https://min-api.cryptocompare.com/data/top/exchanges?fsym="
const historyParams = "&tsym=";
const historyFiat = "GBP";
const historyParamsTwo = "&limit=";
const historyDays = "7"
// used as argument to sum all values in an array
const reducer = (accumulator, currentValue) => accumulator + currentValue;
// creates currency symbols array
const getSymbols = () => {
	let coins = [];
	fetch("https://min-api.cryptocompare.com/data/top/totalvol?limit=100&tsym=USD", {
		method: 'GET'
	})
	.then(response => response.json())
	.then(response => {
		for (let i = 0; i < response.Data.length; ++i) {
			coins.push(`${response.Data[i].CoinInfo.Name} - ${response.Data[i].CoinInfo.FullName}`)
		}
		populateSelect(coins.sort());
	})
}
// creates array of days
const getDays = () => {
	const days = [7, 14, 30];
	populateSelectDays(days);
}
// creates array of FIAT symbols
const getFiatSymbols = () => {
	let symbols = ["GBP", "EUR", "USD", "AUD", "CAD"];
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
		loadChart("#chart",response, currency);
	})
}
// prepares exchange data from API 
const loadExchangeData = (currency, coin) => {
	fetch(`${exchanges}${coin.split(" ")[0]}${historyParams}${currency}`, {
		method: 'GET'
		})
		.then(response => response.json())
		.then(response => {
			if (response.Data.length !== 0) {	
				let volume24 = [];
				response.Data.forEach(function(element) {
					volume24.push(element.volume24hTo)
				});
				let sum = volume24.reduce(reducer);
				const selectFiat = document.querySelector('#selectFiatCurrency').value;
				document.getElementById('coinHeader').innerHTML = `${coin.split(" ")[0]} 24 hour trading volume ${selectFiat}: ${sum.toFixed(0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}`
			} else {
				document.getElementById('coinHeader').innerHTML = `${coin}`
			}
		})
}
// Populates bar chart with data 
const loadChart = (div, data, currency) => {
	let chart = c3.generate({
		bindto: div,
		data: {
			columns: [
				['Pound', data.GBP]
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
				['Euro', data.EUR]
	        ]
	    });
	}, 400);
	setTimeout(function () {
	    chart.load({
	        columns: [
				['USD', data.USD]
	        ]
	    });
	}, 800);
	setTimeout(function () {
	    chart.load({
	        columns: [
				['AUD', data.AUD]
	        ]
	    });
	}, 1200);
	setTimeout(function () {
	    chart.load({
	        columns: [
				['CAD', data.CAD]
	        ]
	    });
	}, 1600);
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
	let closePrices = [];
	let openPrices = [];
		response.Data.forEach(function(element) {
			lows.push(element.low)
			highs.push(element.high)
			sum.push(element.low + element.high)
			dates.push(moment.unix(element.time).format("DD-MM"))
			closePrices.push(element.close)
			openPrices.push(element.open)
		});
		let avg = sum.map(i => (i.toFixed(4) / 2));
		loadLineChart("#lineChart", lows, highs, avg, coin, dates, closePrices, openPrices);
	})
}
// populates line chart
const loadLineChart = (div ,lows, highs, avg, coin, dates, closePrices, openPrices) => {
	lowArray = ['Low'];
	averageArray = ['Average'];
	highArray = ['High'];
	closeArray = ['Close'];
	openArray = ['Open'];
	for (let i = 0; i < lows.length; i++) {
		lowArray.push(lows[i])
		averageArray.push(avg[i])
		highArray.push(highs[i])
		closeArray.push(closePrices[i])
		openArray.push(openPrices[i])
	}
	let chart = c3.generate({
		bindto: div,
	    data: {
	        columns: [
	            lowArray,
	            averageArray,
	            highArray,
	            closeArray,
	            openArray
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
  		loadExchangeData(selectFiat, selectCoin);
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
  		loadExchangeData(selectFiat, selectCoin);
		document.getElementById('averageHeader').innerHTML = `${selectCoin.split(" ")[0]} ${selectDay} day High/Low.`;
		loadLineChartData(selectCoin.split(" ")[0], selectFiat, selectDay);
	} else {
		loadExchangeData(selectFiat, "BTC");
		document.getElementById('averageHeader').innerHTML = `${currency.split(" ")[0]} ${selectDay} day High/Low.`;
		loadLineChartData(currency.split(" ")[0], selectFiat, selectDay);
	}
});

// populates h2 tag on load
document.getElementById('averageHeader').innerHTML = `${currency.split(" ")[0]} 7 day High/Low.`;

// callbacks 
getSymbols();
getDays();
getFiatSymbols();
loadChartData(currency.split(" ")[0]);
loadLineChartData(currency.split(" ")[0], historyFiat, historyDays);
loadExchangeData("GBP", "BTC");