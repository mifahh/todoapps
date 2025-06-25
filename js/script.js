const todos = [];
const RENDER_EVENT = 'render-todo';
const SAVED_EVENT = 'save-todo';
const STORAGE_KEY = 'TODO_APPS';
// const todos = loadData(); //bisa tapi pas refresh perlu submit sekali agar tampil

document.addEventListener("DOMContentLoaded", function () {
    const submitform = document.getElementById("form");
    submitform.addEventListener("submit", function (event) {
        event.preventDefault(); 
        addToDo();
    });
    
    document.addEventListener(RENDER_EVENT, function(){
        const containerTodoList = document.getElementById("list-todo");
        // const containerList = document.querySelector('.list-item');
        containerTodoList.innerHTML = '';

        const containerCompleteList = document.getElementById('list-complete');
        containerCompleteList.innerHTML = '';

        for(const todoItem of todos){
            const container = makeToDo(todoItem);
            // containerList.appendChild(container); jika pakai query selector
            if(todoItem.isCompleted === false){

                containerTodoList.append(container);
            }
            else{
                containerCompleteList.append(container);
            }
        }
    });
    if(isStorageExist()){
        loadData();
    }

    document.addEventListener(SAVED_EVENT, function (event){
        const message = event.detail?.message;
        const dialog = document.getElementById('dialog');
        if(isShowModalSupport()){
            const paragraf = dialog.querySelector('p');
            paragraf.innerText = message;
            if (!dialog.open) {
                dialog.showModal();
            }
        }else{
            Swal.fire({  
                title: 'Berhasil!',
                text: message,
                icon: 'success',
                confirmButtonText: 'Oke'
            });
        }
    });
});

function addToDo(){
    const title = document.getElementById('title').value;
    const timeStamp = document.getElementById('date').value;
    
    const elementID = generateId();
    const objectToDo = createObject(elementID, title, timeStamp, false);
    
    todos.push(objectToDo);
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    const message = textDialog("add");
    saveData(message);
}

function generateId(){
    return +new Date();
}

function createObject(id, title, timeStamp, isCompleted) {
    return{
        id,
        title,
        timeStamp,
        isCompleted
    };
}

function makeToDo(objectToDo){
    const textTitle = document.createElement('h2');
    textTitle.innerText = objectToDo.title;

    const textTimeStamp = document.createElement('p');
    textTimeStamp.innerText = objectToDo.timeStamp;

    const textContainer = document.createElement('div');
    textContainer.classList.add('inner');
    textContainer.append(textTitle, textTimeStamp);

    const container = document.createElement('div');
    container.classList.add('item', 'shadow');
    container.append(textContainer);
    container.setAttribute("id", `todo-${objectToDo.id}`);
    
    if(objectToDo.isCompleted){
        const undoButton = document.createElement('button');
        undoButton.classList.add('undo-button');

        undoButton.addEventListener('click', function(){
            undoTask(objectToDo.id);
        });

        const trashButton = document.createElement('button');
        trashButton.classList.add('trash-button');

        trashButton.addEventListener('click', function(){
            removeTask(objectToDo.id);
        });

        container.append(undoButton, trashButton);
    }else{
        const checkButton = document.createElement('button');
        checkButton.classList.add('check-button');

        checkButton.addEventListener('click', function(){
            completeTask(objectToDo.id);
        });

        container.append(checkButton);
    }

    return container;
}

function completeTask(id){
    // for(const todoItem of todos){
    //     if(todoItem.id === id){
    //         todoItem.isCompleted = true;
    //     }
    // }
    const todoItem = findTodo(id);
    if(todoItem == null) return;

    todoItem.isCompleted = true;
    document.dispatchEvent(new Event(RENDER_EVENT));
    const message = textDialog("complete");
    saveData(message);
}

function undoTask(id){
    // for(const todoItem of todos){
    //     if(todoItem.id === id){
    //         todoItem.isCompleted = false;
    //     }
    // }

    const todoItem = findTodo(id);
    if(todoItem == null) return;
    
    todoItem.isCompleted = false;

    document.dispatchEvent(new Event(RENDER_EVENT));

    const message = textDialog("undo");
    saveData(message);
}

function removeTask(id){
    // for(const todoItem of todos){
    //     if(todoItem.id === id){
    //         todos.
    //     }
    // }
    const todoItemIndex = findTodoIndex(id); // karena index dengan id berbeda
    if(todoItemIndex === -1) return; //sudah didelete
    
    todos.splice(todoItemIndex, 1);// akan dihapus berdasakan index

    document.dispatchEvent(new Event(RENDER_EVENT));
    const message = textDialog("delete");
    saveData(message);
}

function findTodo(todoId){
    for(const todoItem of todos){
        if(todoItem.id === todoId){
            return todoItem;
        }
    }
    return null;
}

function findTodoIndex(todoId){
    for(const index in todos){
        if(todos[index].id === todoId)
            return index;
    }

    return -1;
}

function saveData(dialogMessage){
    if(isStorageExist()){
        const parsed = JSON.stringify(todos);
        localStorage.setItem(STORAGE_KEY, parsed);
    
        document.dispatchEvent(new CustomEvent(SAVED_EVENT, {
            detail : {
                message : dialogMessage
            }
        }));
    }
}

function isStorageExist(){
    if (typeof (Storage) === undefined){
        alert('Browser kamu tidak mendukung local storage');
        return false;
    }
    return true;
}

function loadData(){
    const serializedData = localStorage.getItem(STORAGE_KEY);
    let data = JSON.parse(serializedData);
    if (data !== null) {
        for (const todo of data) {
            todos.push(todo);
        }
    }
    // if(data == null){
    //     return [];
    // }
    
    document.dispatchEvent(new Event(RENDER_EVENT));
    // return data; // array memuat data tapi tampilan merender data kosong duluan
}

function textDialog(actionType){
    if (actionType === "add")
        return "To Do List Berhasil ditambahkan";
    else if (actionType === "complete")
        return "To Do List Selesai";
    else if(actionType === "delete")
        return "To Do List Berhasil dihapus";
    else if(actionType === "undo")
        return "To Do List Batal Selesai";
}

function isShowModalSupport(dialog){
    if (typeof dialog.showModal() === 'function'){
        return true;
    }
    return false;
}