// planner loader
// Simulate loader complete and fade out the loader
setTimeout(() => {
    document.querySelector('.loader-wrapper').style.display = 'none';
    // document.querySelector('app-container').style.display = 'block';
  }, 5700);


const menuIcon = document.querySelector(".menu-icon i");
const sidebar = document.querySelector(".sidebar-menu");
const closeMenu = document.querySelector(".close-icon");

menuIcon.addEventListener("click", function(){
    sidebar.style.left = "0px";

})

closeMenu.addEventListener("click", function(){
    sidebar.style.left = "-251px";
})






// const addItemBtn = document.getElementById("add-list-item");
// const addItemModal = document.querySelector(".add-item-modal");
// const closeModal = document.querySelector(".add-item-modal .close");

// addItemBtn.addEventListener("click", function(){
//     addItemModal.style.display = "block";

// })

// closeModal.addEventListener("click", function(){
//     addItemModal.style.display = "none";
// })




let editingIndex = null; // null means we're adding, not editing
let activeReminderIndex = null;

document.addEventListener("DOMContentLoaded", () => {


    if (!localStorage.getItem("habits")) {
        localStorage.setItem("habits", JSON.stringify([]));
    }

    if (!localStorage.getItem("reminders")) {
        localStorage.setItem("reminders", JSON.stringify([]));
    }

    if (!localStorage.getItem("list-items")) {
        localStorage.setItem("list-items", JSON.stringify([]));
    }

    if (!localStorage.getItem("todo-tags")) {
        localStorage.setItem("todo-tags", JSON.stringify([]));
    }

    if (!localStorage.getItem("pastelMobileList")) {
        localStorage.setItem("pastelMobileList", JSON.stringify([]));
    }



    // show username
    function getUserName() {
        let username = localStorage.getItem("username");

        if (!username) {
            username = prompt("enter your username");

            if (username)
                localStorage.setItem("username", username);
        }

        return username;
    }

    function showUserName() {
        let username = getUserName();

        const user = document.querySelector(".user-info-menu h2");
        const userInfo = document.querySelector(".user-info h2");
        if (userInfo) {
            userInfo.textContent = `Welcome back, ${username}! 👋`;
        }

        if(user){
            user.textContent = `Welcome back, ${username}! 👋`;
        }
    }

    showUserName();


    function habitTracker() {
        const addHabitBtn = document.getElementById("add-habit-btn");
        const habitModal = document.getElementById("habit-modal");
        const closeHabitBtn = document.getElementById("close-habit-btn");
        const saveHabitBtn = document.getElementById("save-habit-btn");

        // Open Modal
        addHabitBtn.addEventListener("click", () => {
            habitModal.style.display = "block";
        });

        // Close Modal
        closeHabitBtn.addEventListener("click", () => {
            habitModal.style.display = "none";
        });

        // Optional: Close modal if clicking outside modal content
        window.addEventListener("click", (e) => {
            if (e.target == habitModal) {
                habitModal.style.display = "none";
            }
        });

        //load habits once the dom content is loaded
        loadHabits();

        saveHabitBtn.addEventListener("click", function () {
            const habitImageInput = document.getElementById("habit-image");
            const habitInput = document.getElementById("habit-name");
            const name = habitInput.value.trim();
            const file = habitImageInput.files[0];

            if (name && file) {
                const reader = new FileReader();

                reader.onload = function (e) {
                    const base64Image = e.target.result;

                    const habits = JSON.parse(localStorage.getItem("habits")) || [];
                    habits.push({ name: name, image: base64Image });

                    localStorage.setItem("habits", JSON.stringify(habits));

                    //reset fields
                    habitInput.value = ""; //clear the input field
                    habitImageInput.value = ""; //clear the image input field
                    habitModal.style.display = "none";
                    loadHabits(); //refresh the habit blocks
                };

                reader.readAsDataURL(file); //read the file as a data url
            }
            else if (name) {
                // Optional fallback if user doesn't upload an image
                const habits = JSON.parse(localStorage.getItem("habits")) || [];
                habits.push({ name, image: "" }); // or a placeholder image
                localStorage.setItem("habits", JSON.stringify(habits));
                habitInput.value = "";
                habitImageInput.value = "";
                habitModal.style.display = "none";
                loadHabits();
            }
        })
    }

    habitTracker();

    function reminders() {
        const addReminderBtn = document.getElementById("add-reminder-btn");
        const closeReminderBtn = document.getElementById("close-reminder-btn");
        const saveReminderBtn = document.getElementById("save-reminder-btn");
        const reminderModal = document.getElementById("reminder-modal");

        addReminderBtn.addEventListener("click", function () {
            reminderModal.style.display = "block";
        })

        closeReminderBtn.addEventListener("click", function () {
            reminderModal.style.display = "none";
        })

        window.addEventListener("click", function (e) {
            if (e.target == reminderModal) {
                reminderModal.style.display = "none";
            }
        })

        loadReminders();

        saveReminderBtn.addEventListener("click", function () {
            const reminderInput = document.getElementById("reminder-text");
            const reminderTime = document.getElementById("reminder-time");
            const rem = reminderInput.value.trim();
            const time = reminderTime.value.trim() || "No time specified";


            if (rem) {
                const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

                if (editingIndex !== null) {
                    // Edit existing
                    reminders[editingIndex] = { rem, time };
                    editingIndex = null; // reset
                } else {
                    // Add new
                    reminders.push({ rem, time });
                }

                localStorage.setItem("reminders", JSON.stringify(reminders));
                reminderInput.value = "";
                reminderTime.value = "";
                document.getElementById("reminder-modal").style.display = "none";
                loadReminders();
            }
        });


    }

    reminders();


    function setupTodoSection() {
        const addBtn = document.getElementById("add-todo-btn");
        const input = document.getElementById("todo-text");
        const tagInput = document.getElementById("todo-tag");
        const tagDropdown = document.getElementById("todo-tag-select");
        const container = document.getElementById("todo-container");

        let todos = JSON.parse(localStorage.getItem("todos")) || [];
        // let tags = JSON.parse(localStorage.getItem("todo-tags")) || [];

        let tags = [];

        try {
            const storedTags = JSON.parse(localStorage.getItem("todo-tags"));
            if (Array.isArray(storedTags)) {
                tags = storedTags;
            }
        } catch (e) {
            console.error("Failed to parse tags from localStorage", e);
        }


        // Filter buttons
        document.querySelectorAll(".filter-btn").forEach((btn) => {
            btn.addEventListener("click", function () {
                document.querySelectorAll(".filter-btn").forEach((b) => b.classList.remove("active"));
                this.classList.add("active");

                const filterType = this.dataset.filter;
                applyFilter(filterType);
            });
        });

        function applyFilter(type) {
            const allTodos = JSON.parse(localStorage.getItem("todos")) || [];

            let filtered = allTodos;
            const today = new Date().toISOString().split("T")[0];

            if (type === "today") {
                filtered = allTodos.filter((todo) => todo.dueDate === today);
            } else if (type === "upcoming") {
                filtered = allTodos.filter((todo) => todo.dueDate > today);
            } else if (type === "completed") {
                filtered = allTodos.filter((todo) => todo.completed);
            }

            renderTodos(filtered);
        }

        addBtn.addEventListener("click", () => {
            const value = input.value.trim();
            const tagValue = tagInput.value.trim() || tagDropdown.value;

            if (value) {
                todos.push({
                    text: value,
                    completed: false,
                    tag: tagValue || "General",  // Default fallback
                    dueDate: new Date().toISOString().split("T")[0]
                });

                if (tagValue && !tags.includes(tagValue)) {
                    tags.push(tagValue);
                    saveTags();
                }

                input.value = "";
                tagInput.value = "";
                saveTodos();
            }
        });

        function renderTodos(list = todos) {
            container.innerHTML = "";
            list.forEach((todo, index) => {
                const card = document.createElement("div");
                card.className = "todo-card";
                if (todo.completed) card.classList.add("completed");

                const left = document.createElement("div");
                left.className = "todo-left";

                const dot = document.createElement("div");
                dot.className = "priority-dot";

                const taskText = document.createElement("h3");
                taskText.textContent = todo.text;

                left.append(dot, taskText);

                if (todo.tag && todo.tag !== "none") {
                    const tagEl = document.createElement("span");
                    tagEl.className = `task-tag ${todo.tag}`;
                    tagEl.textContent = todo.tag;
                    left.appendChild(tagEl);
                }

                const buttons = document.createElement("div");
                buttons.className = "todo-buttons";

                const doneBtn = document.createElement("button");
                doneBtn.textContent = todo.completed ? "Undo" : "Done";
                doneBtn.onclick = () => {
                    todos[index].completed = !todos[index].completed;
                    saveTodos();
                };

                const delBtn = document.createElement("button");
                delBtn.textContent = "Delete";
                delBtn.onclick = () => {
                    todos.splice(index, 1);
                    saveTodos();
                };

                buttons.append(doneBtn, delBtn);
                card.append(left, buttons);
                container.appendChild(card);
            });
        }


        function renderTags() {
            const tagList = document.getElementById("tag-list");
            tagList.innerHTML = "";

            tags.forEach((tag) => {
                const li = document.createElement("li");
                li.textContent = tag;
                li.className = "tag-item";
                li.addEventListener("click", () => filterByTag(tag));
                tagList.appendChild(li);
            });
        }

        function filterByTag(tag) {
            const filtered = todos.filter(todo => todo.tag === tag);
            renderTodos(filtered);
        }



        function saveTodos() {
            localStorage.setItem("todos", JSON.stringify(todos));
            renderTodos();
            renderTags();
        }

        function saveTags() {
            localStorage.setItem("todo-tags", JSON.stringify(tags));
        }




        function renderTagsMenu() {
            const tagList = document.getElementById("tag-list-menu");
            tagList.innerHTML = "";

            tags.forEach((tag) => {
                const li = document.createElement("li");
                li.textContent = tag;
                li.className = "tag-item-menu";
                li.addEventListener("click", () => filterByTag(tag));
                tagList.appendChild(li);
            });
        }

        function filterByTag(tag) {
            const filtered = todos.filter(todo => todo.tag === tag);
            renderTodos(filtered);
        }



        function saveTodos() {
            localStorage.setItem("todos", JSON.stringify(todos));
            renderTodos();
            renderTags();
        }

        function saveTags() {
            localStorage.setItem("todo-tags", JSON.stringify(tags));
        }



        renderTodos();
        renderTags();
        renderTagsMenu();
    }

    setupTodoSection();




    // settings 
    function userSettings() {
        const settingsBtn = document.querySelector(".settings");
        const settingsModal = document.querySelector(".settings-modal");
        const closeSettings = document.querySelector(".close-settings");
        const saveSettings = document.getElementById("save-username");
        const editUsernameInput = document.getElementById("edit-username");
        const clearUsernameBtn = document.getElementById("clear-username");


        //user greeting 
        const username = document.querySelector(".user-info h2");
        const greeting = username.value;

        // settings modal
        settingsBtn.addEventListener("click", function () {
            editUsernameInput.value = localStorage.getItem("username") || "";
            settingsModal.style.display = "block";
        })

        closeSettings.addEventListener("click", function () {
            settingsModal.style.display = "none";
            editUsernameInput.value = "";
        });


        window.addEventListener("click", (e) => {
            if (e.target == settingsModal) {
                settingsModal.style.display = "none";
            }
        });

        // save button logic
        saveSettings.addEventListener("click", function () {
            let newname = editUsernameInput.value.trim();

            if (newname) {
                localStorage.setItem("username", newname);
                username.textContent = `Welcome back, ${newname}! 👋`;
                settingsModal.style.display = "none";
            }
        });

        clearUsernameBtn.addEventListener("click", () => {
            localStorage.removeItem("username");
            if (greeting) greeting.textContent = "";
            settingsModal.style.display = "none";
            alert("Username cleared. Reload to set again.");
        });

    }
    userSettings();



    loadReminders();




    const listInput = document.getElementById('listInput');
const addBtn = document.getElementById('addBtn');
const listContainer = document.getElementById('listContainer');

function renderList() {
  listContainer.innerHTML = '';
  const items = JSON.parse(localStorage.getItem('list-items')) || [];
  items.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item;

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '&times;';
    delBtn.className = 'delete-btn-list';
    delBtn.onclick = () => {
      items.splice(index, 1);
      localStorage.setItem('list-items', JSON.stringify(items));
      renderList();
    };

    li.appendChild(delBtn);
    listContainer.appendChild(li);
  });
}

addBtn.addEventListener('click', () => {
  const value = listInput.value.trim();
  if (value) {
    const items = JSON.parse(localStorage.getItem('list-items')) || [];
    items.push(value);
    localStorage.setItem('list-items', JSON.stringify(items));
    listInput.value = '';
    renderList();
  }
});

window.addEventListener('DOMContentLoaded', renderList);



const mobileInput = document.getElementById('mobileListInput');
const mobileAddBtn = document.getElementById('mobileAddBtn');
const mobileListContainer = document.getElementById('mobileListContainer');

function renderMobileList() {
  mobileListContainer.innerHTML = '';
  const mobileItems = JSON.parse(localStorage.getItem('pastelMobileList')) || [];
  mobileItems.forEach((item, index) => {
    const li = document.createElement('li');
    li.textContent = item;

    const delBtn = document.createElement('button');
    delBtn.innerHTML = '&times;';
    delBtn.className = 'mobile-delete-btn';
    delBtn.onclick = () => {
      mobileItems.splice(index, 1);
      localStorage.setItem('pastelMobileList', JSON.stringify(mobileItems));
      renderMobileList();
    };

    li.appendChild(delBtn);
    mobileListContainer.appendChild(li);
  });
}

mobileAddBtn.addEventListener('click', () => {
  const value = mobileInput.value.trim();
  if (value) {
    const mobileItems = JSON.parse(localStorage.getItem('pastelMobileList')) || [];
    mobileItems.push(value);
    localStorage.setItem('pastelMobileList', JSON.stringify(mobileItems));
    mobileInput.value = '';
    renderMobileList();
  }
});

window.addEventListener('DOMContentLoaded', renderMobileList);



});





// loading and displaying habits
function loadHabits() {
    const habitContainer = document.querySelector(".habit-cards");
    habitContainer.innerHTML = "";

    const habits = JSON.parse(localStorage.getItem("habits")) || [];

    habits.forEach((habit, idx) => {
        const block = document.createElement("div");
        block.className = "habit-block";


        // Add image
        const img = document.createElement("img");
        img.src = habit.image || "https://via.placeholder.com/50"; // Fallback
        img.alt = habit.name;

        // Add habit name
        const nameDiv = document.createElement("div");
        nameDiv.className = "text-content";
        nameDiv.textContent = habit.name;

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.addEventListener("click", () => deleteHabit(idx));


        // Append both to block
        block.appendChild(img);
        block.appendChild(nameDiv);
        block.appendChild(deleteBtn);

        // Add to container
        habitContainer.appendChild(block);

        img.addEventListener("click", () => openHabitNotePopup(idx));

    });
}

function openHabitNotePopup(index) {
    const popup = document.getElementById("habit-note-popup");
    const textarea = document.getElementById("habit-note-textarea");

    const savedNote = localStorage.getItem(`habit-note-${index}`) || "";
    textarea.value = savedNote;

    popup.style.display = "block";
    document.body.classList.add("no-scroll")


    document.getElementById("save-habit-note").onclick = () => {
        localStorage.setItem(`habit-note-${index}`, textarea.value);
        popup.style.display = "none";
    };

    document.getElementById("close-habit-note").onclick = () => {
        popup.style.display = "none";
        document.body.classList.remove("no-scroll")

    };

    textarea.addEventListener("input", function () {
        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    })
}



function loadReminders() {
    const reminderContainer = document.querySelector(".reminder-cards");
    reminderContainer.innerHTML = "";

    const reminders = JSON.parse(localStorage.getItem("reminders")) || [];

    // reminders.push({
    //     rem: "text here",
    //     time: "time here",
    //     notes: "notes here",
    // })

    reminders.forEach((reminder, index) => {
        const dateObj = reminder.time !== "No time specified" ? new Date(reminder.time) : null;

        const note = document.createElement("div");
        note.className = "reminder-note";

        const title = document.createElement("h2");
        title.textContent = reminder.rem;
        
                const options = {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true
                };
        
                const formattedTime = dateObj
                    ? dateObj.toLocaleString("en-US", options)
                    : "No time specified";

        const time = document.createElement("p");
        time.textContent = `${formattedTime}`;


        //         💡 "Stop the bubble, save the trouble!"
        // (Because events bubble up the DOM, and this stops them.) --> use stopPropagation()

        // --- Edit button ---
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "edit-btn";
        editBtn.onclick = (e) => {
            e.stopPropagation();
            editReminder(index);
        };

        //  --- Delete button ---
        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "delete-btn";
        deleteBtn.onclick = (e) => {
            e.stopPropagation();
            deleteReminder(index);
        };



        // adding text area feature
        const popup = document.getElementById("note-popup");
        const textarea = document.getElementById("note-textarea");
        const saveBtn = document.getElementById("save-note-btn");
        const closeBtn = document.getElementById("close-note-popup");


        const notes = document.createElement("div");
        notes.className = "reminder-note";

        note.addEventListener("click", () => {
            activeReminderIndex = index;
            textarea.value = reminder.notes || ""; // Load existing note if any
            popup.classList.remove("hidden");
            document.body.classList.add("no-scroll");
        });

        textarea.addEventListener("input", function () {
            textarea.style.height = "auto";
            textarea.style.height = textarea.scrollHeight + "px";
        })

        saveBtn.addEventListener("click", () => {
            const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
            if (activeReminderIndex !== null) {
                reminders[activeReminderIndex].notes = textarea.value;
                localStorage.setItem("reminders", JSON.stringify(reminders));
            }
            popup.classList.add("hidden");
            document.body.classList.remove("no-scroll");
            loadReminders();
        });

        closeBtn.addEventListener("click", () => {
            popup.classList.add("hidden");
            document.body.classList.remove("no-scroll");
        });

        const notePreview = document.createElement("p");
        notePreview.className = "note-preview";
        notePreview.textContent = reminder.notes
            ? reminder.notes.slice(0, 50) + (reminder.notes.length > 50 ? "..." : "")
            : "📝 Click to add note";
        notePreview.style.fontStyle = "italic";
        // notePreview.style.color = "#555";
        // notePreview.style.marginTop = "6px";


        textarea.appendChild(notePreview);
        // notes.appendChild(textarea)


        note.appendChild(title);
        note.appendChild(time);
        note.appendChild(editBtn);
        note.appendChild(deleteBtn);
        note.appendChild(notePreview)

        reminderContainer.append(note);

    });
}


function editReminder(index) {
    const reminders = JSON.parse(localStorage.getItem("reminders")) || [];
    const reminder = reminders[index];

    document.getElementById("reminder-text").value = reminder.rem;
    document.getElementById("reminder-time").value = reminder.time || "";

    editingIndex = index; // now we are editing this index

    document.getElementById("reminder-modal").style.display = "block";
}


function deleteReminder(index) {
    const reminders = JSON.parse(localStorage.getItem("reminders"));
    reminders.splice(index, 1); //removes 1 item at the specified index
    localStorage.setItem("reminders", JSON.stringify(reminders));
    loadReminders();
}

function deleteHabit(idx) {
    const habits = JSON.parse(localStorage.getItem("habits"));
    habits.splice(idx, 1); //removes 1 item at the specified index
    localStorage.setItem("habits", JSON.stringify(habits));
    loadHabits();
}


