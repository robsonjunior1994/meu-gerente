window.userDb = (() => {
    const databaseName = "SeuGerenteDb";
    const databaseVersion = 3;
    const usersStoreName = "users";
    const employeesStoreName = "employees";

    function openDb() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(databaseName, databaseVersion);

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains(usersStoreName)) {
                    const store = db.createObjectStore(usersStoreName, { keyPath: "id" });
                    store.createIndex("email", "email", { unique: true });
                }

                let employeeStore;
                if (!db.objectStoreNames.contains(employeesStoreName)) {
                    employeeStore = db.createObjectStore(employeesStoreName, { keyPath: "id" });
                } else {
                    employeeStore = request.transaction.objectStore(employeesStoreName);
                }

                if (!employeeStore.indexNames.contains("ownerEmail")) {
                    employeeStore.createIndex("ownerEmail", "ownerEmail", { unique: false });
                }

                if (!employeeStore.indexNames.contains("ownerEmail_email")) {
                    employeeStore.createIndex("ownerEmail_email", ["ownerEmail", "email"], { unique: true });
                }

                if (!employeeStore.indexNames.contains("email")) {
                    employeeStore.createIndex("email", "email", { unique: true });
                }
            };

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async function findEmployeeByEmail(email) {
        const db = await openDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(employeesStoreName, "readonly");
            const store = transaction.objectStore(employeesStoreName);
            const index = store.index("email");
            const request = index.get(email);

            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error);
        });
    }

    async function addUser(user) {
        const db = await openDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(usersStoreName, "readwrite");
            const store = transaction.objectStore(usersStoreName);
            const request = store.add(user);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async function findUserByEmail(email) {
        const db = await openDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(usersStoreName, "readonly");
            const store = transaction.objectStore(usersStoreName);
            const index = store.index("email");
            const request = index.get(email);

            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error);
        });
    }

    async function addEmployee(employee) {
        const db = await openDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(employeesStoreName, "readwrite");
            const store = transaction.objectStore(employeesStoreName);
            const request = store.add(employee);

            request.onsuccess = () => resolve(true);
            request.onerror = () => reject(request.error);
        });
    }

    async function findEmployeeByOwnerAndEmail(ownerEmail, email) {
        const db = await openDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(employeesStoreName, "readonly");
            const store = transaction.objectStore(employeesStoreName);
            const index = store.index("ownerEmail_email");
            const request = index.get([ownerEmail, email]);

            request.onsuccess = () => resolve(request.result ?? null);
            request.onerror = () => reject(request.error);
        });
    }

    async function getEmployeesByOwner(ownerEmail) {
        const db = await openDb();

        return new Promise((resolve, reject) => {
            const transaction = db.transaction(employeesStoreName, "readonly");
            const store = transaction.objectStore(employeesStoreName);
            const index = store.index("ownerEmail");
            const request = index.getAll(ownerEmail);

            request.onsuccess = () => resolve(request.result ?? []);
            request.onerror = () => reject(request.error);
        });
    }

    return {
        addUser,
        findUserByEmail,
        addEmployee,
        findEmployeeByOwnerAndEmail,
        findEmployeeByEmail,
        getEmployeesByOwner
    };
})();
