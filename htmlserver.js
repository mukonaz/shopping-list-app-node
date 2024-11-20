const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

// Define file path for shopping list
const shoppingListFilePath = path.join(__dirname, 'shopping-list.json');

// Create a basic HTTP server
const server = http.createServer((req, res) => {
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Serve static files like HTML, CSS, and JS
    if (req.method === 'GET') {
        if (pathname === '/' || pathname === '/index.html') {
            fs.readFile(path.join(__dirname, 'index.html'), 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Error loading HTML file');
                }
                res.writeHead(200, { 'Content-Type': 'text/html' });
                res.end(data);
            });
        } else if (pathname === '/styles.css') {
            fs.readFile(path.join(__dirname, 'styles.css'), 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Error loading CSS file');
                }
                res.writeHead(200, { 'Content-Type': 'text/css' });
                res.end(data);
            });
        } else if (pathname === '/script.js') {
            fs.readFile(path.join(__dirname, 'script.js'), 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Error loading JS file');
                }
                res.writeHead(200, { 'Content-Type': 'application/javascript' });
                res.end(data);
            });
        }
        // API to get all shopping list items
        else if (pathname === '/shopping-list') {
            fs.readFile(shoppingListFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Error reading shopping list file' }));
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
            
        }
    }

// Handling POST requests (Add new item)
else if (req.method === 'POST' && pathname === '/shopping-list') {
    let body = '';
    req.on('data', chunk => {
        body += chunk;
    });
    req.on('end', () => {
        try {
            const newItem = JSON.parse(body);

            // Validate the incoming data
            if (!newItem.item || !newItem.quantity) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Item and quantity are required' }));
            }

            // Read the current shopping list
            fs.readFile(shoppingListFilePath, 'utf8', (err, data) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Error reading shopping list file' }));
                }

                const shoppingList = JSON.parse(data);
                shoppingList.push(newItem);

                // Save the updated shopping list
                fs.writeFile(shoppingListFilePath, JSON.stringify(shoppingList, null, 2), (err) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Error saving shopping list' }));
                    }

                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(newItem));
                });
            });
        } catch (err) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
        }
    });
}


    // Handle PUT requests (Update existing item)
    else if (req.method === 'PUT' && pathname.startsWith('/shopping-list/')) {
        const itemName = pathname.split('/')[2]; // Get item name from URL
        let body = '';

        req.on('data', chunk => {
            body += chunk;
        });
        req.on('end', () => {
            try {
                const updateData = JSON.parse(body);

                // Read the current shopping list
                fs.readFile(shoppingListFilePath, 'utf8', (err, data) => {
                    if (err) {
                        res.writeHead(500, { 'Content-Type': 'text/plain' });
                        return res.end('Error reading shopping list file');
                    }

                    const shoppingList = JSON.parse(data);
                    const item = shoppingList.find(i => i.item === itemName);

                    if (!item) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Item not found' }));
                    }

                    // Update item quantity
                    item.quantity = updateData.quantity;

                    // Save the updated shopping list
                    fs.writeFile(shoppingListFilePath, JSON.stringify(shoppingList, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, { 'Content-Type': 'text/plain' });
                            return res.end('Error saving shopping list');
                        }

                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(item));
                    });
                });
            } catch (err) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Invalid JSON' }));
            }
        });
    }

    // Handle DELETE requests (Delete an item)
    else if (req.method === 'DELETE' && pathname.startsWith('/shopping-list/')) {
        const itemName = pathname.split('/')[2]; // Get item name from URL

        // Read the current shopping list
        fs.readFile(shoppingListFilePath, 'utf8', (err, data) => {
            if (err) {
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Error reading shopping list file');
            }

            const shoppingList = JSON.parse(data);
            const updatedList = shoppingList.filter(i => i.item !== itemName);

            if (shoppingList.length === updatedList.length) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Item not found' }));
            }

            // Save the updated shopping list
            fs.writeFile(shoppingListFilePath, JSON.stringify(updatedList, null, 2), (err) => {
                if (err) {
                    res.writeHead(500, { 'Content-Type': 'text/plain' });
                    return res.end('Error saving shopping list');
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ message: 'Item deleted successfully' }));
            });
        });
    }

    // Handle unknown routes (404)
    else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
