const SEPARATOR = (1.1).toLocaleString().charAt(1);
const ALLOWED_NUMBER_INPUT_CHARS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', SEPARATOR];
const VALUE_INPUT = document.getElementById("entry-value-input");
const TYPE_ICON = document.getElementById("entry-type-icon");
const HISTORY_CONTAINER = document.getElementById("entry-history-container")
let newEntryIsPlus = true;

const isInputValid = (char) => {
    if (!ALLOWED_NUMBER_INPUT_CHARS.includes(char)) return false;
    
    let decimalPointIndex = null;
    const value = VALUE_INPUT.value;
    if (parseFloat(value + char) > Number.MAX_VALUE) return false;

    for (let i = 0; i < value.length; i++) {
        if (value.charAt(i) === SEPARATOR) {
            if (decimalPointIndex !== null) return false;
            decimalPointIndex = i;
        }
    }

    if (char === SEPARATOR) {
        if (decimalPointIndex !== null) return false;
        if (!value) return false;
    }
    if (decimalPointIndex === 0) return false;

    return true;
}

const parseInput = () => {
    return parseFloat(VALUE_INPUT.value.replace(SEPARATOR, '.'));
}

const handleTypeClick = () => {
    newEntryIsPlus = !newEntryIsPlus;
    if (newEntryIsPlus)
        TYPE_ICON.classList.replace("fa-minus", "fa-plus");
    else
        TYPE_ICON.classList.replace("fa-plus", "fa-minus");
}

const presentRecords = (records) => {
    // Record = {
    //      id, 
    //      desc, 
    //      value, 
    //      date 
    // }
    let builder = ""
    for (record of records) {
        builder += 
            `<div class="entry ${record.value > 0 ? "green" : "red"}">
                <p class="entry-date">${record.date}</p>
                <div class="entry-details">
                    <h2>${record.value.toFixed(2)}</h2>
                    <span>${record.desc}</span>
                </div>
            </div>`
    }
    HISTORY_CONTAINER.innerHTML = builder;
}

const demo = () => {
    const records = [];
    for (let i = 0; i < 10; i++) {
        records.push(
            {
                id: i,
                desc: i + "th record",
                value: (i % 2 == 0 ? 1 : -1) * Math.random() * 100,
                date: Date.now()
            }
        )
    }
    presentRecords(records);
}

demo();