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

    // check due date
    auditTask(taskLi);


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
        // then loop over sub-array
        arr.forEach(function(task) {
            createTask(task.text, task.date, list);
        });
    });
};

var saveTasks = function() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
};

var auditTask = function(taskEl) {
    //get date from task element
    var date = $(taskEl).find("span").text().trim;

    // convert to moment object at 5:00
    var time = moment(date, "L").set("hour", 17);

    // remove any old classes from element
    $(taskEl).removeClass("list-group-item-warning list-group-item-danger");

    if (moment().isAfter(time)) {
        $(taskEl).addClass("list-group-item-danger");
    } else if (Math.abs(moment().diff(time, "days")) <= 2) {
        $(taskEl).addClass("list-group-item-warning");
    }
};

// THIS SORTS OUT THE TASKS IN THE CARD
// also places the new card inside a new card as well
$(".card .list-group").sortable({
    // this connects with the id's of other elements in the HTML
    // in this case its the classes of these elements
    connectWith: $(".card .list-group"),
    scroll: false,
    tolerance: "pointer",
    helper: "clone",
    activate: function(event) {
        console.log("activate", this);
    },
    deactivate: function(event) {
        console.log("deactivate", this);
    },
    over: function(event) {
        console.log("over", event.target);
    },
    out: function(event) {
        console.log("out", event.target);
    },
    update: function(event) {
        // array to store the task data in
        var tempArr = [];

        // loop over current set of children in sortable list
        $(this).children().each(function() {
            var text = $(this)
                .find("p")
                .text()
                .trim();

            var date = $(this)
                .find("span")
                .text()
                .trim();

            // add task data to the temp array as an object
            tempArr.push({
                text: text,
                date: date
            });
        });

        // trim down list's ID to match object property
        var arrName = $(this)
            .attr("id")
            .replace("list- ", "");

        // update array on tasks object and save
        tasks[arrName] = tempArr;
        saveTasks();
    }

});

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
    //console.log(text);
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

    // enable jquery ui datepicker
    dateInput.datepicker({
        minDate: 1,
        onClose: function() {
            // when calendar is closed, force a "change" event on the 'dateInput'
            $(this).trigger("change");
        }
    });

    // automatically focus on the new element
    dateInput.trigger("focus");
});

// value of due date was changed
$(".list-group").on("change", "input[type='text']", function() {
    var date = $(this).val();

    var status = $(this).closest(".list-group").attr("id").replace("list-", "");
    var index = $(this).closest(".list-group-item").index();

    tasks[status][index].date = date;
    saveTasks();

    var taskSpan = $("<span>").addClass("badge badge-primary badge-pill").text(date);
    $(this).replaceWith(taskSpan);

    // Pass task's <li> element into auditTask() to check new due date
    auditTask($(taskSpan).closest(".list-group-item"));
});


$("#trash").droppable({
    accept: ".card .list-group-item",
    tolerance: "touch",
    drop: function(event, ui) {
        ui.draggable.remove();

        console.log("drop");
    },
    over: function(event, ui) {},
    out: function(event, ui) {}
});



// modal was triggered
$("#task-form-modal").on("show.bs.modal", function() {
    // clear values
    $("#modalTaskDescription, #modalDueDate").val("");
});

$("#modalDueDate").datepicker({
    minDate: 1
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