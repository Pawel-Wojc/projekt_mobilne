const SEPARATOR = (1.1).toLocaleString().charAt(1);
const ALLOWED_NUMBER_INPUT_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', SEPARATOR, '-'];
const VALUE_INPUT = document.getElementById("entry-value-input");
const HISTORY_CONTAINER = document.getElementById("entry-history-container");
const DESC_INPUT = document.getElementById("entry-desc-input");
const SCROLL_TRIGGER = document.getElementById("scroll-trigger");
const USER_ID = localStorage.getItem("myKey");
let loadedEntries = [];
let currentPage = 1;
let totalPages = null;
let entries = [];

const isInputValid = (char) => {
    const value = VALUE_INPUT.value;
    const selectionStart = VALUE_INPUT.selectionStart;
    const selectionEnd = VALUE_INPUT.selectionEnd;
    
    if (!ALLOWED_NUMBER_INPUT_CHARS.includes(char)) return false;
    
    if (char === '-') {
        return selectionStart === 0 && !value.includes('-');
    }
    
    if (char === SEPARATOR) {
        const hasSeparator = value.includes(SEPARATOR);
        const isAfterMinus = value.startsWith('-') && selectionStart === 1;
        
        return !hasSeparator && 
               (selectionStart !== 0 || isAfterMinus) &&
               (selectionStart !== value.length || value.length > 0);
    }
    
    const newValue = value.slice(0, selectionStart) + char + value.slice(selectionEnd);
    if (newValue === '-' || newValue === '-' + SEPARATOR) return true;
    
    const numberValue = parseFloat(newValue.replace(SEPARATOR, '.'));
    if (isNaN(numberValue)) return false;
    
    return Math.abs(numberValue) <= Number.MAX_VALUE;
}

const parseValueInput = () => {
    return parseFloat(VALUE_INPUT.value.replace(SEPARATOR, '.'));
}

const addRecord = async () => {
    try {
        await createNewRecord();
        presentRecords(loadedEntries);
        DESC_INPUT.value = "";
        VALUE_INPUT.value = "";
    }
    catch (ex) {} // already caught
}

const createNewRecord = async () => {
    const newRecord = {
        userId: USER_ID,
        date: Date.now(),
        value: parseValueInput(),
        desc: DESC_INPUT.value,
    }

    try {
        const response = await fetch(`${API_URL}/addRecord`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newRecord)
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        loadedEntries.unshift(newRecord);
        alert("Pomyślnie zapisano nową transakcję.");
    }
    catch (error) {
        console.error("Błąd przy zapisie nowej transakcji.", error);
        alert("Błąd przy zapisie nowej transakcji.")
    }
}

const presentRecords = () => {
    let builder = ""
    for (record of loadedEntries) {
        builder += 
            `<div class="entry ${record.value > 0 ? "green" : "red"}">
                <p class="entry-date">${formatDate(record.date)}</p>
                <div class="entry-details">
                    <h2>${record.value.toFixed(2)}</h2>
                    <span>${record.desc}</span>
                </div>
            </div>`
    }
    HISTORY_CONTAINER.innerHTML = builder;
}

const formatDate = (date) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
  
    return `${year}-${month}-${day}`;
}

const fetchEntries = async () => {
    if (currentPage > (totalPages || 1)) {
        return;
    }
    try {
        const response = await fetch(`${API_URL}/get-trasnactions?userId=${USER_ID}&page=${currentPage}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            },
        });

        if (!response.ok) {
            const errorMessage = await response.text();
            throw new Error(errorMessage);
        }

        const data = await response.json();
        loadedEntries = loadedEntries.concat(data.records);
        totalPages = data.totalPages;
        ++currentPage;
    } 
    catch (error) {
        console.error("Błąd wczytywania historii transakcji", error);
        alert("Błąd wczytywania historii transakcji")
    }
}

const loadMoreContent = async () => {
    await fetchEntries();
    presentRecords();
}

const observer = new IntersectionObserver((entries) => {
    const firstEntry = entries[0];
    if (firstEntry.isIntersecting) {
        loadMoreContent();
    }
}, {
    threshold: 0.1,
});

if (SCROLL_TRIGGER) {
    observer.observe(SCROLL_TRIGGER);
}
