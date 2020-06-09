import globalManager from '../js/global'
/**
 * User-cancelable task in the notification area
 */
class Task
{
    constructor({name, description, icon, state })
    {
        this.id = null;
        this.name = name;
        this.description = description;
        this.icon = icon || 'developer_board';
        this.state = state || 'idle';
    }
    /**
     * Show user the notification about the task has started
     */
    run()
    {
        this.state = 'running';
        globalManager.Vue.$store.commit('addTask', this);
    }
    /**
     * Show user the notification about the task has completed
     */
    completed()
    {
        this.state = 'completed';
        globalManager.Vue.$emit('someTaskCompleted');
    }
    /**
     * Show user the notification about the task has failed
     */
    failed()
    {
        this.state = 'failed';
        globalManager.Vue.$emit('someTaskCompleted');
    }
    /**
     * Remove the task from notification area
     */
    delete()
    {
        globalManager.Vue.$store.commit('removeTask', this.id);
    }
}
/**
 * @class
 * @classdesc Manipulate tasks in the notification area
 */
var Tasks = {
    assignedSureDetection: false,
    makeUserSure(event)
    {
        const text = "Opuštěním stránky zrušíte všechny probíhající úkoly. Opravdu to chcete udělat?";
        event.preventDefault();
        event.returnValue = text;
        return text;
    },
    /**
     * Create a new named task and show it to the user in the notification area
     * @param {string} name Title of the task
     * @param {string} description Text under the title
     * @param {string} icon Material-icons string to display as the task icon
     */
    AddActive(name, description, icon) //Returns "Task" object
    {
        const newTask = new Task({name, description, icon});
        newTask.run();
        return newTask;
        /*var nat = document.getElementById("noActiveTasks");
        if (nat) nat.outerHTML = "";
        for (var newId = 0; newId < this.activeTasks.length; newId++)
        {
            var match = false;
            for (var x = 0; x < this.activeTasks.length; x++)
            {
                if (newId == this.activeTasks[x].id) match = true;
            }
            if (!match) break;
        }
        this.activeTasks.push({
            name: name,
            id: newId,
            icon: icon,
            completed: false
        });
        var newTaskElement = $("#dummyTask").clone().removeClass("d-none").attr("id", "task-" + newId);
        if (name)
            newTaskElement.find("span").html(name);
        if (description)
            newTaskElement.find("label").html(description).removeClass("d-none").addClass("d-inline-block");
        if (icon)
            newTaskElement.find(".primaryIcon").html(icon);
        $("#taskList").append(newTaskElement);
        this.updateTaskCount();

        return {
            id: newId,
            element: newTaskElement,
            completed: function ()
            {
                Tasks.MarkCompleted(newId);
            },
            failed: function ()
            {
                Tasks.MarkFailed(newId)
            }
        }*/
    },
    /**
     * Make the task disappear withou user noticing anything
     * @param {Number} id 
     */
    Remove(id) //One should also delete all references to a task... (delete t;)
    {
        for (var i = this.activeTasks.length - 1; i >= 0; i--)
        {
            if (this.activeTasks[i].id === id)
            {
                this.activeTasks.splice(i, 1);
            }
        }
        var tsk = $("#taskList>#task-" + id).addClass("unopaque");
        var _this = this;
        setTimeout(function ()
        {
            tsk.remove();
            if (_this.activeTasks.length == 0)
            {
                $("#clearTasks").addClass("unopaque");
            }
        }, 500);
    },
    /**
     * Return task object by its ID
     * @param {Number} id 
     * @returns {Task}
     */
    Find(id)
    {
        for (var i = this.activeTasks.length - 1; i >= 0; i--)
            if (this.activeTasks[i].id === id) return this.activeTasks[i];
    },
    /**
     * Show the user notification about the task has finished
     * @param {Number} id 
     */
    MarkCompleted(id)
    {
        var taskItem = $("#taskList>#task-" + id);
        taskItem.find(".loading-icon").removeClass("d-none");
        taskItem.find(".hover-red").click(function ()
        {
            Tasks.Remove(id);
        });
        Tasks.Find(id).completed = true;
        $("#clearTasks").removeClass("unopaque");
    },
    /**
     * Show the user notification about the task has failed
     * @param {Number} id 
     */
    MarkFailed(id)
    {
        var taskItem = $("#taskList>#task-" + id);
        taskItem.find(".loading-icon").removeClass("d-none");
        taskItem.find(".text-success").html("report_problem").removeClass("text-success").addClass("text-warning")
        taskItem.find(".hover-red").click(function ()
        {
            Tasks.Remove(id);
        });
        Tasks.Find(id).completed = true;
        Tasks.Find(id).failed = true;
        $("#clearTasks").removeClass("unopaque");
    },
    /**
     * Remove all already completed tasks from the notification area
     */
    ClearCompleted()
    {
        "use strict";
        for (var i = this.activeTasks.length - 1; i >= 0; i--)
        {
            if (this.activeTasks[i].completed)
            {
                let tsk = $("#taskList>#task-" + this.activeTasks[i].id).addClass("unopaque");
                setTimeout(function ()
                {
                    tsk.remove();
                }, 500);
                this.activeTasks.splice(i, 1);
            }
        }
        $("#clearTasks").addClass("unopaque");
    },
    /**
     * Count of already completed Tasks
     */
    get CompletedCount()
    {
        const tasks = globalManager.Vue.$store.state.tasks;
        var count = 0;
        for (var i = tasks.length - 1; i >= 0; i--)
            if (tasks[i].state == 'completed') count++;
        return count;
    },
    /**
     * The count of ongoing tasks = total - completed - failed
     */
    get UncompletedCount()
    {
        const tasks = globalManager.Vue.$store.state.tasks;
        var count = 0;
        for (var i = tasks.length - 1; i >= 0; i--)
            if (tasks[i].state != 'completed'&&tasks[i].state != 'failed') count++;
        return count;
    }
};
export default Tasks;