const apiUrl = 'http://localhost:3000/shopping-list';

const shoppingListElement = document.getElementById('shoppingList');
const addItemForm = document.getElementById('addItemForm');
const updateItemForm = document.getElementById('updateItemForm');
const deleteItemForm = document.getElementById('deleteItemForm');

function getShoppingList() {
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {
            shoppingListElement.innerHTML = '';
            data.forEach(item => {
                const listItem = document.createElement('li');
                listItem.innerHTML = `
                    <span>${item.item} (Quantity: ${item.quantity})</span>
                    <button onclick="deleteItem('${item.item}')">Delete</button>
                `;
                shoppingListElement.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching shopping list:', error));
}

function addItem(event) {
    event.preventDefault();
    const itemName = document.getElementById('itemName').value;
    const itemQuantity = document.getElementById('itemQuantity').value;

    const newItem = {
        item: itemName,
        quantity: itemQuantity
    };

fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ item: newItem, quantity: itemQuantity })
})
.then(response => {
    if (!response.ok) {
        return response.json().then(errorData => {
            throw new Error(errorData.error);
        });
    }
    return response.json(); // parse the successful response
})
.then(data => {
    console.log('Item added:', data);
    // Update the UI with the new item
})
.catch(error => {
    console.error('Error adding item:', error.message);
    // Show an error message on the UI
});

}


function updateItem(event) {
    event.preventDefault();
    const itemName = document.getElementById('updateItemName').value;
    const itemQuantity = document.getElementById('updateQuantity').value;

    const updatedItem = {
        quantity: itemQuantity
    };

    fetch(`${apiUrl}/${itemName}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedItem)
    })
    .then(response => response.json())
    .then(() => {
        getShoppingList(); 
        updateItemForm.reset();
    })
    .catch(error => console.error('Error updating item:', error));
}

function deleteItem(itemName) {
    fetch(`${apiUrl}/${itemName}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(() => {
        getShoppingList(); 
    })
    .catch(error => console.error('Error deleting item:', error));
}


addItemForm.addEventListener('submit', addItem);
updateItemForm.addEventListener('submit', updateItem);
deleteItemForm.addEventListener('submit', event => {
    event.preventDefault();
    const itemName = document.getElementById('deleteItemName').value;
    deleteItem(itemName);
});

window.onload = getShoppingList;
