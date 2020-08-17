var tasks = {};

var createTask = function(taskText, taskDate, taskList) {
    // create elements that make up a task item
    var taskLi = $("<li>").addClass("list-group-item");
    var taskSpan = $("<span>")
        .addClass("badge badge-primary badge-pill")
        .text(taskDate);
    var taskP = $("<p>")
        .addClass("m-1")
        .text(taskText);

    // append span and p element to parent li
    taskLi.append(taskSpan, taskP);


    // append to ul list on the page
    $("#list-" + taskList).append(taskLi);
};

var loadTasks = function() {
    tasks = JSON.parse(localStorage.getItem("tasks"));

    // if nothing in localStorage, create a new object to track all task status arrays
    if (!tasks) {
        tasks = {
            toDo: [],
            inProgress: [],
            inReview: [],
            done: []
        };
    }

    // loop over object properties
    $.each(tasks, function(list, arr) {
        console.log(list, arr);
        // then loop over sub-array
        arr.forEach(function(task) {
            createTask(task.text, task.date, list);
        });
    });
};

var saveTasks = function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

$(".list-group").on("click", "p", function() {
    // .text() will get the inner text content of the current element
    var text = $(this)
        .text()
        .trim();
    // $("<textarea>") -> find all existing elements
    // $("<textarea>") tells jQuery to create a new element
    var textInput = $("<textarea>")
        .addClass("form-control")
        .val(text);
    console.log(text);
    // changes the <p> element to a textInput box
    $(this).replaceWith(textInput);
    // highlights the input box automatically for the user
    textInput.trigger("focus");
});

$(".list-group").on("blur", "textarea", function() {
    // get the text-area's current value/text
    var text = $(this)
        .val()
        .trim();

    // get the parent ul's id attribute
    var status = $(this)
        .closest(".list-group")
        // this is returning the ID, with will be "list-"
        .attr("id")
        // replace is not a jQuery method but a JS operator
        // finds and replaces the text in the string
        .replace("list-", "");

    // get the task's position in the list of other li elements
    var index = $(this)
        .closest(".list-group-item")
        .index();

    // breaking this down
    // tasks is an object
    // task[status] -> returns the array (in this case "toDo")
    // tasks[status][index] -> returns the object at the given index in the array
    // tasks[status][index].tasks -> returns the text property of the object at the given index
    tasks[status][index].text = text;
    saveTasks();

    // recreate p element
    var taskP = $("<p>")
        // add the class to the p element
        .addClass("m-1")
        // making the text to actual text
        .text(text);

    // replace textarea with p element
    $(this).replaceWith(taskP);
});

// due date was clicked
$(".list-group").on("click", "span", function() {
    // need to get the current text
    var date = $(this)
        .text()
        .trim();

    // create new input element
    var dateInput = $("<input>")
        .attr("type", "text")
        .addClass("form-control")
        .val(date);

    // swap out the elements
    $(this).replaceWith(dateInput);

    // automatically focus on the new element
    dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("blur", "input[type='text']", function() {
    // get the current text
    var date = $(this)
        .val()
        .trim()

    // get the parent ul's id attribute
    var status = $(this)
        .closest(".list-group")
        .attr("id")
        .replace("list-", "");

    // get the task's position in the list of other li elements
    var index = $(this)
        .closest(".list-group-item")
        .index();

    // update span element with boostrap classes
    var taskSpan = $("<span>")
        .addClass("badge badge-primary badge-pill")
        .text(date);

    //replace input with span element
    $(this).replaceWith(taskSpan);
});



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
    // clear values
    $("#modalTaskDescription, #modalDueDate").val("");
});

// modal is fully visible
$("#task-form-modal").on("shown.bs.modal", function() {
    // highlight textarea
    $("#modalTaskDescription").trigger("focus");
});

// save button in modal was clicked
$("#task-form-modal .btn-primary").click(function() {
    // get form values
    var taskText = $("#modalTaskDescription").val();
    var taskDate = $("#modalDueDate").val();

    if (taskText && taskDate) {
        createTask(taskText, taskDate, "toDo");

        // close modal
        $("#task-form-modal").modal("hide");

        // save in tasks array
        tasks.toDo.push({
            text: taskText,
            date: taskDate
        });

        saveTasks();
    }
});

// remove all tasks
$("#remove-tasks").on("click", function() {
    for (var key in tasks) {
        tasks[key].length = 0;
        $("#list-" + key).empty();
    }
    saveTasks();
});

// load tasks for the first time
loadTasks();