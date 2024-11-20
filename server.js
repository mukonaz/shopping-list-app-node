const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const shoppingListFilePath = path.join(__dirname, 'data', 'shopping-list.json');

// Create the server
const server = http.createServer((req, res) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);

    // GET method - Retrieve shopping list
    if (req.method === 'GET' && req.url === '/shopping-list') {
        fs.readFile(shoppingListFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Could not read the file.' }));
            }
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(data);
        });
    }
    // POST method - Add new item to the shopping list
    else if (req.method === 'POST' && req.url === '/shopping-list') {
        let body = '';

        req.on('data', (chunk) => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const newItem = JSON.parse(body);

                // Read the current shopping list
                fs.readFile(shoppingListFilePath, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Could not read the file.' }));
                    }

                    const shoppingList = JSON.parse(data);
                    shoppingList.push(newItem); // Add the new item

                    // Save the updated shopping list
                    fs.writeFile(shoppingListFilePath, JSON.stringify(shoppingList, null, 2), (writeErr) => {
                        if (writeErr) {
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({ error: 'Could not write to the file.' }));
                        }

                        // Success response
                        res.writeHead(201, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ message: 'Item added successfully!', item: newItem }));
                    });
                });
            } catch (parseErr) {
                // Handle invalid JSON
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON format.' }));
            }
        });
    }

    // PUT/PATCH method - Update an existing item in the shopping list
else if ((req.method === 'PUT' || req.method === 'PATCH') && req.url.startsWith('/shopping-list/')) {
    const itemName = req.url.split('/').pop(); // Extract the item name (or ID) from the URL
    let body = '';

    req.on('data', (chunk) => {
        body += chunk.toString();
    });

    req.on('end', () => {
        try {
            const updatedItem = JSON.parse(body);

            // Read the current shopping list
            fs.readFile(shoppingListFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Could not read the file.' }));
                }

                const shoppingList = JSON.parse(data);
                const itemIndex = shoppingList.findIndex(item => item.item === itemName);

                if (itemIndex === -1) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Item not found.' }));
                }

                // Update the item
                shoppingList[itemIndex] = { ...shoppingList[itemIndex], ...updatedItem };

                // Save the updated shopping list
                fs.writeFile(shoppingListFilePath, JSON.stringify(shoppingList, null, 2), (writeErr) => {
                    if (writeErr) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Could not write to the file.' }));
                    }

                    // Success response
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ message: 'Item updated successfully!', item: shoppingList[itemIndex] }));
                });
            });
        } catch (parseErr) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON format.' }));
        }
    });
}

// DELETE method - Remove an item from the shopping list
else if (req.method === 'DELETE' && req.url.startsWith('/shopping-list/')) {
    const itemName = req.url.split('/').pop(); // Extract the item name (or ID) from the URL

    fs.readFile(shoppingListFilePath, 'utf8', (err, data) => {
        if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Could not read the file.' }));
        }

        const shoppingList = JSON.parse(data);
        const itemIndex = shoppingList.findIndex(item => item.item === itemName);

        if (itemIndex === -1) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Item not found.' }));
        }

        // Remove the item from the list
        shoppingList.splice(itemIndex, 1);

        // Save the updated shopping list
        fs.writeFile(shoppingListFilePath, JSON.stringify(shoppingList, null, 2), (writeErr) => {
            if (writeErr) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Could not write to the file.' }));
            }

            // Success response
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: 'Item deleted successfully!' }));
        });
    });
}


    // Handle other routes (404 Not Found)
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

// Start the server
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
