import globalManager from '../js/global'
class Task
{
    constructor(name, description, icon, state)
    {
        this.id = null;
        this.name = name;
        this.description = description;
        this.icon = icon || 'developer_board';
        this.state = state || 'idle';
    }
    run()
    {
        this.state = 'running';
        globalManager.Vue.$store.commit('addTask', this);
        Tasks.updateTaskCount();
    }
    completed()
    {
        this.state = 'completed';
        Tasks.updateTaskCount();
    }
    delete()
    {
        globalManager.Vue.$store.commit('removeTask', this.id);
    }
}
const Tasks = {
    /**
     * @type HTMLElement
     */
    indicatorElement: null,
    assignedSureDetection: false,
    makeUserSure(event)
    {
        const text = "Opuštěním stránky zrušíte všechny probíhající úkoly. Opravdu to chcete udělat?";
        event.preventDefault();
        event.returnValue = text;
        return text;
    },
    updateTaskCount()
    {
        var count = this.UncompletedCount;
        if (count > 9)
            this.indicatorElement.innerHTML = "filter_9_plus";
        else if (count == 0)
        {
            this.indicatorElement.innerHTML = ("assistant");
            window.removeEventListener('beforeunload', this.makeUserSure);
            this.assignedSureDetection = false;
        } else
        {
            this.indicatorElement.innerHTML = ("filter_" + count);
            if (!this.assignedSureDetection)
            {
                window.addEventListener('beforeunload', this.makeUserSure);
                this.assignedSureDetection = true;
            }
        }
    },
    AddActive(name, description, icon) //Returns "Task" object
    {
        const newTask = new Task(name, description, icon);
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
    Remove: function (id) //One should also delete all references to a task... (delete t;)
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
    Find: function (id)
    {
        for (var i = this.activeTasks.length - 1; i >= 0; i--)
            if (this.activeTasks[i].id === id) return this.activeTasks[i];
    },
    MarkCompleted: function (id)
    {
        var taskItem = $("#taskList>#task-" + id);
        taskItem.find(".loading-icon").removeClass("d-none");
        taskItem.find(".hover-red").click(function ()
        {
            Tasks.Remove(id);
        });
        Tasks.Find(id).completed = true;
        $("#clearTasks").removeClass("unopaque");
        this.updateTaskCount();
    },
    MarkFailed: function (id)
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
        this.updateTaskCount();
    },
    ClearCompleted: function ()
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
    get CompletedCount()
    {
        const tasks = globalManager.Vue.$store.state.tasks;
        var count = 0;
        for (var i = tasks.length - 1; i >= 0; i--)
            if (tasks[i].state == 'completed') count++;
        return count;
    },
    get UncompletedCount()
    {
        const tasks = globalManager.Vue.$store.state.tasks;
        var count = 0;
        for (var i = tasks.length - 1; i >= 0; i--)
            if (tasks[i].state != 'completed') count++;
        return count;
    }
};
export default Tasks;