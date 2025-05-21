export const checkLoginStatus = async () => {
    const userKey = localStorage.getItem('myKey');

    try {
        const response = await fetch(
            `http://localhost:3000/api/checkAuth?userKey=${encodeURIComponent(
                userKey
            )}`,
            {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        );

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        return true;
    } catch (error) {
        console.error('Błąd podczas sprawdzania statusu logowania:', error);
        return false;
    }
};
