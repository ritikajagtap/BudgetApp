//Budget Controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value,
        this.percentage = -1
    }
    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value / totalIncome )*100);
        }else{
            this.percentage = -1;
        }
    };
    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };
    var Income = function (id, description, value) {
        this.id = id,
        this.description = description,
        this.value = value
    }
    var data = {
        allItems: {
            inc: [],
            exp: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }
    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum = sum + cur.value;
        });
        data.totals[type] = sum;
    }
    return {
        deleteItem: function(type, id){
            var index, ids;
            ids = data.allItems[type].map(function(current){
                return current.id;
            });
            //ids is storing the indexes of th current data items in an array and index are the indexes of the elements in ids
            index = ids.indexOf(id);

            if(index !== -1){
                data.allItems[type].splice(index, 1);
            }

        },
        addItem: function (type, des, val) {
            var newItem, ID;
            //[1 2 3 4 5] next ID = 6
            //[1 2 4 6 7] next ID = 8 and not 6
            //therefore we can say : ID = last ID +1
            if (data.allItems[type].length > 0) {
                //last ID                     
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;

            } else {
                ID = 0;
            }
            //Create new Item based on 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }
            //push it into our data structure
            data.allItems[type].push(newItem);

            // Return thr new element
            return newItem;
        },
        calculatePercentages: function(){
            data.allItems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });
        },
        getPercentages: function(){
            var allPerc = data.allItems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },
        calculateBudget: function () {
            //Calculate Total Income And expenses
            calculateTotal('exp');
            calculateTotal('inc');

            data.budget = data.totals.inc - data.totals.exp;
            if (data.totals.inc > 0) {
                //Calculate the budget : income - expense
                //Calculate expense percentaage: income*expense/100
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },
        testing: function () {
            console.log(data);
        }

    }
})();

//UI Controller
var UIController = (function () {
    var DOMstrings = {
        //we made this object in order if we have to change the class name of a element e'lljust have to  make changes here and nowhere else
        //in order to make this object get accessed globally what will do is, inn return will write a new method next to getInput which will be called geetDOMStrings/ or whatver and that will return DOMstrings object
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetValue: '.budget__value',
        totalIncome: '.budget__income--value',
        totalExpense: '.budget__expenses--value',
        percentageExpense: '.budget__expenses--percentage',
        container: '.container',
        expensesPercentage: '.item__percentage',
        monthDisplay: '.budget__title--month'
    }
    return {
        getInput: function () {
            return {
                //now here we have to return three values at the same time the best solution for this is we return an object containing these three values
                type: document.querySelector(DOMstrings.inputType).value, //will be either inc or exp
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value),
                discription: document.querySelector(DOMstrings.inputDescription).value
            }
        },
        addListItem: function (obj, type) {
            var html, newHtml, element;
            //Create HTML string with placeholder text

            if (type === 'inc') {
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            } else if (type === 'exp') {
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>'
            }

            //Replace placeholder text with some data

            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);

            //Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        clearFields: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMstrings.inputDescription + ', ' + DOMstrings.inputValue);
            //we have converted the list into an array
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, inndex, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        deleteListItem : function(selectorID){
            var el;
            el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        displayBudget: function (obj) {
            document.querySelector(DOMstrings.budgetValue).textContent = obj.budget;
            document.querySelector(DOMstrings.totalExpense).textContent = obj.totalExp;
            document.querySelector(DOMstrings.totalIncome).textContent = obj.totalInc;
            
            if(obj.percentage !== -1){
                document.querySelector(DOMstrings.percentageExpense).textContent = obj.percentage + '%';
            }else{
                document.querySelector(DOMstrings.percentageExpense).textContent = '--';

            }
        },
        displayPercentages: function(percentages){
            var fields = document.querySelectorAll(DOMstrings.expensesPercentage);
            var nodeListForEach = function(list, callback){
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i);
                }
            };
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + '%';
                }else{
                    current.textContent = '--';

                }
            });
        },
        displayMonth: function(){
            var year, months, month, now;
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            now = new Date();
            year = now.getFullYear();
            month = now.getMonth();
            document.querySelector(DOMstrings.monthDisplay).textContent = months[month] + ' ' + year;
        },
        getDOMstrings: function () {
            return DOMstrings;
        }
    };
})();

//Controller is going to connect between the two modules 
var Controller = (function (budgetCtrl, UICtrl) {

    var setEventListeners = function () {
        //this is how we access the objects of the variable which is passed as a parameter
        var DOM = UICtrl.getDOMstrings();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                //console.log('event');
                ctrlAddItem();
            }
        })
        //as we have to perform event delegation we are doing so
        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
    }
    var updatePercentages = function(){
        //1.Calcualte percentages
        budgetCtrl.calculatePercentages();
        //2.read them from budget Controller
        var percentages = budgetCtrl.getPercentages();
        //3.Update the UI   
        console.log(percentages);
        UICtrl.displayPercentages(percentages);
    }
    var updateBudget = function () {
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        //2. Return thr budget
        var budget = budgetCtrl.getBudget();
        //3. Update the UI
        UICtrl.displayBudget(budget);

        console.log(budget);
    }

    var ctrlAddItem = function () {
        var newItem, input;
        //1. Get the filed input data
        input = UICtrl.getInput();
        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            //console.log(input);

            //2. Add the item to the controller
            newItem = budgetController.addItem(input.type, input.discription, input.value);
            //3. add new item to UI 
            UICtrl.addListItem(newItem, input.type);
            //Clearing fields
            UICtrl.clearFields();
            //Calculate and update budget 
            updateBudget();

            //Calculate and update the percentages
            updatePercentages();
        }


    };
    var ctrlDeleteItem = function(event){
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id; 
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete an item from the Data Sturcture 
            budgetCtrl.deleteItem(type, ID);
            //2. Delete the Item from the UI
            UICtrl.deleteListItem(itemID);
            //3. Update the budget, percentage in the UI
            updateBudget();
        }
    }
    return {
        init: function () {
            console.log('Your Application has started');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: 0
            })
            setEventListeners();
        }
    }


})(budgetController, UIController);
Controller.init();
