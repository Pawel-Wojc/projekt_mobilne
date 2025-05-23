const API_URL = "https://projekt-mobilne.onrender.com/api";

const registerUser = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const data = await response.json();
    } catch (error) {
        console.error('Błąd podczas tworzenia użytkownika:', error);
    }
};

const loginUser = async () => {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                username: username,
                password: password,
            },
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('response', data);
        localStorage.setItem('myKey', data.message);

        window.location.href = '../finance-entries/finance-entries.html';
    } catch (error) {
        console.error('Błąd podczas logowania użytkownika:', error);
    }
};

const isLoggedIn = () => {
    return localStorage.getItem('userId');
};

// Sprawdź stan zalogowania przy załadowaniu strony
window.onload = () => {
    if (isLoggedIn()) {
        console.log('LoggedIn');
        //   showDashboard();
    } else {
        console.log('not LoggedIn');
        //showLoginPage();
    }
};
