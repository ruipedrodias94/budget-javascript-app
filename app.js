/**
 * Uso de IEFF de forma a que os componentes estejam decopulados uns dos outros
 * Isto permite que sejam feitas alterações a apenas ao módulo que queremos.
 */

// Budget Controller

var budgetController = (function () {
	// Function constructor, because we will use more than one of this type
	var Expense = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
		this.percentage = -1;
	};

	Expense.prototype.calculatePercentages = function (totalIncome) {
		if (totalIncome > 0) {
			this.percentage = Math.round((this.value / totalIncome) * 100);
		} else {
			this.percentage = -1;
		}
	};

	Expense.prototype.getPercentage = function () {
		return this.percentage;
	};

	var Income = function (id, description, value) {
		this.id = id;
		this.description = description;
		this.value = value;
	};

	// Array of expenses and incomes

	var dataBudget = {
		allItems: {
			exp: [],
			inc: []
		},
		total: {
			exp: 0,
			inc: 0
		},
		budget: 0,
		percentage: -1
	};

	// Function that calculates the total of each operation

	var calculateTotal = function (typeOperation) {
		var sumTotal = 0;

		dataBudget.allItems[typeOperation].forEach(function (currentValue) {
			sumTotal += currentValue.value;
		});

		dataBudget.total[typeOperation] = sumTotal;
	};

	return {
		// Add new item to our data structure
		addItem: function (type, description, value) {
			var newItem, ID;

			//[1 2 3 4 5], next ID = 6
			//[1 2 4 6 8], next ID = 9
			// ID = last ID + 1

			// Create new ID
			if (dataBudget.allItems[type].length > 0) {
				ID = dataBudget.allItems[type][dataBudget.allItems[type].length - 1].id + 1;
			} else {
				ID = 0;
			}

			// Create new item based on 'inc' or 'exp' type
			if (type === 'exp') {
				newItem = new Expense(ID, description, value);
			} else if (type === 'inc') {
				newItem = new Income(ID, description, value);
			}

			// Push it into our data structure
			dataBudget.allItems[type].push(newItem);

			// Return the new element
			return newItem;
		},

		deleteItem: function (typeOperation, idOperation) {

			var ids, index;

			ids = dataBudget.allItems[typeOperation].map(function (current) {
				return current.id;
			});

			index = ids.indexOf(idOperation);

			if (index !== -1) {
				dataBudget.allItems[typeOperation].splice(index, 1);
			}
		},

		// Calculate the Budget
		calculateBudget: function (typeOperation) {
			// Calculate the total income and expenses
			calculateTotal(typeOperation);

			// Calculate the budget: income - expenses
			dataBudget.budget = dataBudget.total.inc - dataBudget.total.exp;

			// Calculate the percentage of income that we spent
			if (dataBudget.total.inc > 0) {
				dataBudget.percentage = Math.round((dataBudget.total.exp / dataBudget.total.inc) * 100
				);
			} else {
				dataBudget.percentage = -1;
			}
		},

		// Calculate the percentages
		calculatePercentage: function () {

			dataBudget.allItems.exp.forEach(function (current) {
				current.calculatePercentages(dataBudget.total.inc);
			});
		},

		// Get the percentages

		getPercentages: function () {
			var allPercentages = dataBudget.allItems.exp.map(function (current) {
				return current.getPercentage();
			});
			return allPercentages;
		},

		// Return the budget

		getBudget: function () {
			return {
				budget: dataBudget.budget,
				totalIncome: dataBudget.total.inc,
				totalExpenses: dataBudget.total.exp,
				percentage: dataBudget.percentage
			};
		},

		// Function to test if the item was added
		testing: function () {
			console.log(dataBudget);
		}
	};
})();

// UI Controller

var uiController = (function () {

	var DOMStrings = {
		addClass: ".add__type",
		descriptionClass: ".add__description",
		valueClass: ".add__value",
		addButton: ".add__btn",
		expenses: ".expenses__list",
		incomes: ".income__list",
		budgetLabel: ".budget__value",
		budgetIncome: ".budget__income--value",
		budgetExpenses: ".budget__expenses--value",
		percentage: ".budget__expenses--percentage",
		container: ".container",
		percentagesLabel: ".item__percentage",
		month: ".budget__title--month"
	};

	var formatNumber = function (num, type) {
		var numSplit, int, dec, type;

		num = Math.abs(num);
		num = num.toFixed(2);

		numSplit = num.split('.');

		int = numSplit[0];
		if (int.length > 3) {
			int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3); //input 23510, output 23,510
		}

		dec = numSplit[1];

		return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;

	};

	var nodeListForEach = function (listNodes, callbackFunction) {

		for (var i = 0; i < listNodes.length; i++) {
			callbackFunction(listNodes[i], i);
		}
	};

	// Get the input data

	return {
		getInput: function () {
			return {
				typeOperation: document.querySelector(DOMStrings.addClass).value,
				description: document.querySelector(DOMStrings.descriptionClass).value,
				value: parseFloat(document.querySelector(DOMStrings.valueClass).value)
			};
		},

		getDOMStrings: function () {
			return DOMStrings;
		},

		addItemList: function (object, type) {
			var html, newHtml, elementDOM;

			if (type === "inc") {
				elementDOM = DOMStrings.incomes;
				html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			} else {
				elementDOM = DOMStrings.expenses;
				html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
			}

			// Replace the placeholder
			newHtml = html.replace("%id%", object.id);
			newHtml = newHtml.replace("%description%", object.description);
			newHtml = newHtml.replace("%value%", formatNumber(object.value, type));

			document.querySelector(elementDOM).insertAdjacentHTML("beforeend", newHtml);
		},

		deleteItemList: function (selectorID) {

			// Get the parent and delete the child
			var elementChild = document.getElementById(selectorID);
			elementChild.parentNode.removeChild(elementChild);

		},

		// Clear all the inputs
		clearInputs: function () {
			var fields, fieldsArray;

			// Select all the fields
			fields = document.querySelectorAll(DOMStrings.descriptionClass + ", " + DOMStrings.valueClass);
			// Convert to an array
			fieldsArray = Array.prototype.slice.call(fields);

			fieldsArray.forEach(element => {
				element.value = "";
			});

			fieldsArray[0].focus();
		},

		displayBudget: function (object) {
			var type;
			object.budget > 0 ? type = 'inc' : type = 'exp';

			document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(object.budget, type);
			document.querySelector(DOMStrings.budgetIncome).textContent = formatNumber(object.totalIncome, type);
			document.querySelector(DOMStrings.budgetExpenses).textContent = formatNumber(object.totalExpenses, type);

			if (object.percentage > 0) {
				document.querySelector(DOMStrings.percentage).textContent = object.percentage + " %";
			} else {
				document.querySelector(DOMStrings.percentage).textContent = "---";
			}
		},

		displayPercentages: function (percentagesArray) {

			var fields = document.querySelectorAll(DOMStrings.percentagesLabel);

			nodeListForEach(fields, function (current, index) {
				// Do stuff
				if (percentagesArray[index] > 0) {
					current.textContent = percentagesArray[index] + "%";
				} else {
					current.textContent = "---";
				}

			});
		},

		displayMonth: function () {
			var now, year, month;
			now = new Date();

			var monthNames = ["January", "February", "March", "April", "May", "June",
				"July", "August", "September", "October", "November", "December"
			];

			month = monthNames[now.getMonth()];

			document.querySelector(DOMStrings.month).textContent = month;
		},

		changedType: function () {

			var fields = document.querySelectorAll(
				DOMStrings.addClass + ',' +
				DOMStrings.descriptionClass + ',' +
				DOMStrings.valueClass);

			nodeListForEach(fields, function (cur) {
				cur.classList.toggle('red-focus');
			});

			document.querySelector(DOMStrings.addButton).classList.toggle('red');

		},
	};
})();

// Globall app controller

var controllerApp = (function (bdgCtrl, uiCtrl) {
	var setupEventListeners = function () {
		var DOMStrings = uiCtrl.getDOMStrings();

		document.querySelector(DOMStrings.addButton).addEventListener("click", contrlAddItem);

		document.addEventListener("keypress", function (event) {
			if (event.keyCode === 13 || event.which === 13) {
				contrlAddItem();
			}
		});

		document.querySelector(DOMStrings.container).addEventListener("click", ctrlDeleteItem);

		document.querySelector(DOMStrings.addClass).addEventListener('change', uiCtrl.changedType);

	};

	var updateBudget = function (typeOperation) {
		// 1. Calculate the budget
		budgetController.calculateBudget(typeOperation);
		// 2. Return the budget
		var budget = budgetController.getBudget();
		// 3. Display the budget on the UI
		uiController.displayBudget(budget);
	};

	var updatePercentages = function () {
		// 1. Calculate the percentages
		budgetController.calculatePercentage();

		// 2. Return the percentages
		var percentages = budgetController.getPercentages();
		console.log(percentages);
		// 3. Update the ui percentages

		uiController.displayPercentages(percentages);
	};

	var contrlAddItem = function () {
		var inputs, newItem;

		// 1. Get the input data
		inputs = uiCtrl.getInput();

		// Check the integrity of the data
		if (inputs.description !== "" && !isNaN(inputs.value)) {

			// 2. Send the data to the budget controller
			newItem = bdgCtrl.addItem(inputs.typeOperation, inputs.description, inputs.value);

			// 3. Calculate the budget (budget controller)
			uiCtrl.addItemList(newItem, inputs.typeOperation);

			// 4. Clear the fields
			uiCtrl.clearInputs();

			// 5. Update the Ui controller (add the item and display them)
			updateBudget(inputs.typeOperation);

			// 6. Calculate and update the percentages
			updatePercentages();
		}
	};

	var ctrlDeleteItem = function (event) {

		var itemID, splitID, type, id;

		itemID = (event.target.parentNode.parentNode.parentNode.parentNode.id);

		if (itemID) {

			// The id has the inc-1 structure

			splitID = itemID.split("-");
			type = splitID[0];
			id = parseInt(splitID[1]);

			console.log(splitID);
			// 1. Delete the item from the data structure
			budgetController.deleteItem(type, id);

			// 2. Delete the item from the UI
			uiController.deleteItemList(itemID);

			// 3. Update and show the new UI
			updateBudget(type);

			// 4. Calculate and update the percentages
			updatePercentages();
		}
	};

	// Public function to init the application
	return {
		init: function () {
			console.log("The application has started");
			uiController.displayMonth();
			uiController.displayBudget({
				budget: 0,
				totalIncome: 0,
				totalExpenses: 0,
				percentage: -1 + " %"
			});
			setupEventListeners();
		}
	};
})(budgetController, uiController);

controllerApp.init();