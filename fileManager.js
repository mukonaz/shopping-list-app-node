const fs = require('fs');
const path = require('path');

const shoppingListFilePath = path.join(__dirname, 'data', 'shopping-list.json');

// create file
function createFile() {
    const initialData = [];
    fs.writeFile(shoppingListFilePath, JSON.stringify(initialData, null, 2), (err) => {
        if (err) {
            console.error('Error creating the file:', err);
        } else {
            console.log('File created successfully.');
        }
    });
}

// createFile();

// read file
function readFile() {
    fs.readFile(shoppingListFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
        } else {
            try {
                const shoppingList = JSON.parse(data);
                console.log('Shopping List:', shoppingList);
            } catch (parseErr) {
                console.error('Error parsing JSON:', parseErr);
            }
        }
    });
}

// readFile();

// add an item to the shopping list
function addItem(item) {
    fs.readFile(shoppingListFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            return;
        }

        try {
            const shoppingList = JSON.parse(data);
            shoppingList.push(item); 
            
            fs.writeFile(shoppingListFilePath, JSON.stringify(shoppingList, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to the file:', writeErr);
                } else {
                    console.log('Item added successfully:', item);
                }
            });
        } catch (parseErr) {
            console.error('Error parsing JSON:', parseErr);
        }
    });
}

// addItem({ item: 'Eggs', quantity: 12 });

// delete the shopping list file
function deleteFile() {
    fs.unlink(shoppingListFilePath, (err) => {
        if (err) {
            console.error('Error deleting the file:', err);
        } else {
            console.log('File deleted successfully.');
        }
    });
}

deleteFile();
