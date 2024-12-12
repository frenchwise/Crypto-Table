document.addEventListener("DOMContentLoaded", () => {
	const cryptoResults = document.querySelector("#cryptoResults");
  
	// Fetch data from APIs
	async function fetchData() {
		const cryptoApi = await fetch("https://api.coincap.io/v2/assets");
		const currencyApi = await fetch("https://open.er-api.com/v6/latest/USD");
	
		const [cryptoData, currencyData] = await Promise.all([
			cryptoApi.json(),
			currencyApi.json()
		]);
		
		//console.log(cryptoData);
		//console.log(currencyData);

		const conversionRates = currencyData.rates;
		const top25 = cryptoData.data.slice(0, 25).map((crypto) => ({
			id: crypto.id,
			rank: crypto.rank,
			symbol: crypto.symbol,
			website: crypto.explorer,
			priceUSD: parseFloat(crypto.priceUsd),
			priceGBP: (crypto.priceUsd * conversionRates.GBP),
			priceEUR: (crypto.priceUsd * conversionRates.EUR),
			priceAED: (crypto.priceUsd * conversionRates.AED),
		}));
	
		renderTable(top25);
	}

	function formatCurrency(amount, currency) {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: currency,
			minimumFractionDigits: 2,
			maximumFractionDigits: amount < 0.01 ? 10: 2,//extra digits for Shiba
		}).format(amount);
	}
  
	// Render the table
	function renderTable(data) {
		cryptoResults.innerHTML = "";
		data.forEach((crypto) => {
			const row = document.createElement("tr");

			const priceUSDFormatted = formatCurrency(crypto.priceUSD, 'USD');
			const priceGBPFormatted = formatCurrency(crypto.priceGBP, 'GBP');
			const priceEURFormatted = formatCurrency(crypto.priceEUR, 'EUR');
			const priceAEDFormatted = formatCurrency(crypto.priceAED, 'AED');

			row.innerHTML = `
			<td>${crypto.id}</td>
			<td>${crypto.rank}</td>
			<td>${crypto.symbol}</td>
			<td><a href="${crypto.website}" target="_blank">${crypto.website}</a></td>
			<td data-price="${crypto.priceUSD}">${priceUSDFormatted}</td>
			<td data-price="${crypto.priceGBP}">${priceGBPFormatted}</td>
			<td data-price="${crypto.priceEUR}">${priceEURFormatted}</td>
			<td data-price="${crypto.priceAED}">${priceAEDFormatted}</td>
			`;

			cryptoResults.appendChild(row);
		});
	}

	// Sorting logic
	function sortTable(column, order) {
		const rows = Array.from(cryptoResults.querySelectorAll("tr"));
		const sortedRows = rows.sort((a, b) => {
			const aText = a.querySelector(`td:nth-child(${column})`).dataset.price || a.querySelector(`td:nth-child(${column})`).innerText;
			const bText = b.querySelector(`td:nth-child(${column})`).dataset.price || b.querySelector(`td:nth-child(${column})`).innerText;
	
			const aValue = isNaN(aText) ? aText : parseFloat(aText);
			const bValue = isNaN(bText) ? bText : parseFloat(bText);
	
			// Return 1 or -1 depending on sort order
			if (aValue < bValue) return order === "asc" ? -1 : 1;
			if (aValue > bValue) return order === "asc" ? 1 : -1;
			// Return 0 if a and b are equal
			return 0;
		});
	
		cryptoResults.innerHTML = "";
		sortedRows.forEach((row) => cryptoResults.appendChild(row));
	}
  
	// Event listeners for sorting
	const tableHeaders = document.querySelectorAll("#cryptoTable th");
	tableHeaders.forEach((header, i) => {
		header.addEventListener("click", () => {
			let order;
			if (header.dataset.order === "" || header.dataset.order === "desc") {
				order = "asc";
			} else {
				order = "desc";
			}

			// Remove order and class from all other headers to reset the order when clicking other columns
			tableHeaders.forEach((th) => {
				th.dataset.order = "";
				th.classList.remove("sort-asc", "sort-desc");
			})
			header.dataset.order = order;
			header.classList.add(order === "asc" ? "sort-asc" : "sort-desc");
	
			//+1 because nth-child starts from 1 not 0
			sortTable(i + 1, order);
		});
	});
  
	// Initial fetch and render
	fetchData();
  });
  