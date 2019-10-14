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
    }

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    }

    // Array of expenses and incomes

    var dataBudget = {
        allItems: {
            exp: [],
            inc: []
        },
        total: {
            exp: 0,
            inc: 0
        }
    }

    return {
        // Add new item to our data structure
        addItem: function (type, description, value) {

            var idObject, newItem;

            // Calculate the id number of the object in cause
            if (dataBudget.allItems[type].lenght > 0) {
                idObject = dataBudget.allItems[type][dataBudget.allItems[type] - 1].id + 1;
            } else {
                idObject = 0;
            }

            // Create the object
            if (type === 'exp') {
                newItem = new Expense(idObject, description, value);
            } else {
                newItem = new Income(idObject, description, value);
            }

            // Add the object to the array
            dataBudget.allItems[type].push(newItem);
            return newItem;
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
        addClass: '.add__type',
        descriptionClass: '.add__description',
        valueClass: '.add__value',
        addButton: '.add__btn',
        expenses: '.expenses__list',
        incomes: '.income__list'
    }

    // Get the input data

    return {
        getInput: function () {

            return {
                typeOperation: document.querySelector(DOMStrings.addClass).value,
                description: document.querySelector(DOMStrings.descriptionClass).value,
                value: document.querySelector(DOMStrings.valueClass).value
            };
        },

        getDOMStrings: function () {
            return DOMStrings;
        },

        addItemList: function (object, type) {
            var html, newHtml, elementDOM;

            if (type === 'inc') {
                elementDOM = DOMStrings.incomes;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else {
                elementDOM = DOMStrings.expenses;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            // Replace the placeholder
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', object.value);

            document.querySelector(elementDOM).insertAdjacentHTML('beforeend', newHtml);
        },

        // Clear all the inputs
        clearInputs: function () {
            var fields, fieldsArray;
            
            // Select all the fields
            fields = document.querySelectorAll(DOMStrings.descriptionClass + ', ' + DOMStrings.valueClass);
            // Convert to an array
            fieldsArray = Array.prototype.slice.call(fields);

            fieldsArray.forEach(element => {
                element.value = '';
            });

            fieldsArray[0].focus();
        }

    };

})();

// Globall app controller

var controllerApp = (function (bdgCtrl, uiCtrl) {

    var setupEventListeners = function () {
        var DOMStrings = uiCtrl.getDOMStrings();

        document.querySelector(DOMStrings.addButton).addEventListener('click', contrlAddItem);

        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                contrlAddItem();
            }
        });
    };

    var contrlAddItem = function () {
        var inputs, newItem;

        // 1. Get the input data
        inputs = uiCtrl.getInput();

        // 2. Send the data to the budget controller
        newItem = bdgCtrl.addItem(inputs.typeOperation, inputs.description, inputs.value);

        // 3. Calculate the budget (budget controller)
        uiCtrl.addItemList(newItem, inputs.typeOperation);
        uiCtrl.clearInputs();
        // 4. Update the Ui controller (add the item and display them)

    };

    // Public function to init the application
    return {
        init: function () {
            console.log('The application has started');
            setupEventListeners();
        }
    };

})(budgetController, uiController);

controllerApp.init();