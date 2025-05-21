const registerUser = async () => {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password })
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
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': username,
                'password': password
            },
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const data = await response.json();
        localStorage.setItem("myKey", data.message);
    } catch (error) {
        console.error('Błąd podczas tworzenia użytkownika:', error);
    }
};

const isLoggedIn = () =>{
    return localStorage.getItem("myKey"); 
}

// Sprawdź stan zalogowania przy załadowaniu strony
window.onload = () => {
    if (isLoggedIn()) {
        console.log('LoggedIn');
        showDashboard();
    } else {
        console.log('not LoggedIn');
        showLoginPage();
    }
};
