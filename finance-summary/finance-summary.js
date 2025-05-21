//get history from server.js history=[{"name","date", "amount"}]
// endpointy:
//  get weekly summary z polem current wskazujacy ktory tydzien jest teraz
//  get monthly summary z polem current wskazujacy ktory miesiac jest teraz
//  get yearly summary z polem current wskazujacy ktory rok jest teraz

//find current week dates
startDate = new Date();
endDate = new Date();

let financeRecords = [];
//current state
const ViewState = {
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
};

let currentViewState;

const monthButton = document.getElementById('month-button');
const weekButton = document.getElementById('week-button');
const yearButton = document.getElementById('year-button');
getDataFromApi();
updateStartEndDate = () => {
    switch (currentViewState) {
        case ViewState.WEEK:
            startDate.setDate(new Date().getDate() - (new Date().getDay() - 1));
            startDate.setHours(0, 0, 0, 0);
            endDate.setDate(new Date().getDate() + (7 - new Date().getDay()));
            endDate.setHours(23, 59, 59, 999);
            break;
        case ViewState.MONTH:
            startDate = new Date(
                new Date().getFullYear(),
                new Date().getMonth(),
                1
            );
            endDate = new Date(
                new Date().getFullYear(),
                new Date().getMonth() + 1,
                0
            );
            break;
        case ViewState.YEAR:
            startDate = new Date(new Date().getFullYear(), 0, 1);
            endDate = new Date(new Date().getFullYear(), 11, 31);
            break;
    }
};

getDataFromApi = () => {
    const userKey = localStorage.getItem('myKey');
    fetch(`http://localhost:3000/summary?userKey=${userKey}`)
        .then((response) => response.json())
        .then((data) => {
            financeRecords = data;
            console.log(data);
        })
        .catch((error) => {
            console.error('Error:', error);
        });
};

getRecordsFromRange = (startDate, endDate) => {
    const filteredRecords = financeRecords.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });
    return filteredRecords;
};

function getPolishMonthName(monthNumber) {
    const months = [
        'Styczeń',
        'Luty',
        'Marzec',
        'Kwiecień',
        'Maj',
        'Czerwiec',
        'Lipiec',
        'Sierpień',
        'Wrzesień',
        'Październik',
        'Listopad',
        'Grudzień',
    ];

    // monthNumber: 1-12, więc odejmujemy 1, żeby dostać indeks tablicy
    return months[monthNumber] || null;
}

const updateShownDate = () => {
    const shownDate = document.getElementById('date');
    shownDate.innerHTML = `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;

    switch (currentViewState) {
        case ViewState.WEEK:
            shownDate.innerHTML = `${startDate.getDate()} - ${endDate.getDate()} ${getPolishMonthName(
                startDate.getMonth()
            )} ${startDate.getFullYear()}`;
            break;
        case ViewState.MONTH:
            console.log(startDate);
            shownDate.innerHTML = `${getPolishMonthName(
                startDate.getMonth()
            )}  ${endDate.getFullYear()}`;
            break;
        case ViewState.YEAR:
            shownDate.innerHTML = `${startDate.getFullYear()}`;
            break;
    }
};

const presentSummary = (recordsToShow) => {
    summaryTotal = document.getElementById('summary-total');
    totalAmount = 0;
    summaryList = document.getElementById('summary-list');
    summaryList.innerHTML = '';
    let builder = '';
    recordsToShow.forEach((record) => {
        totalAmount += record.amount;
        builder += `<div class="entry ${record.value > 0 ? 'green' : 'red'}">
                <p class="entry-date">${formatDate(record.date)}</p>
                <div class="entry-details">
                    <h2>${record.value.toFixed(2)}</h2>
                    <span>${record.desc}</span>
                </div>
            </div>`;
    });
    summaryList.innerHTML = builder;
    summaryTotal.innerHTML = `Suma : ${totalAmount}`;
};

const handleWeekClick = () => {
    monthButton.classList.remove('active');
    weekButton.classList.add('active');
    yearButton.classList.remove('active');
    currentViewState = ViewState.WEEK;
    updateStartEndDate();
    updateShownDate();
    presentSummary(getRecordsFromRange(startDate, endDate));
};
handleWeekClick();
const handleMonthClick = () => {
    monthButton.classList.add('active');
    weekButton.classList.remove('active');
    yearButton.classList.remove('active');
    currentViewState = ViewState.MONTH;
    updateStartEndDate();
    updateShownDate();
    presentSummary(getRecordsFromRange(startDate, endDate));
};

const handleYearClick = () => {
    monthButton.classList.remove('active');
    weekButton.classList.remove('active');
    yearButton.classList.add('active');
    currentViewState = ViewState.YEAR;
    updateStartEndDate();
    updateShownDate();
    presentSummary(getRecordsFromRange(startDate, endDate));
};

const handleDateBack = () => {
    switch (currentViewState) {
        case ViewState.WEEK:
            startDate.setDate(startDate.getDate() - 7);
            endDate.setDate(endDate.getDate() - 7);
            break;
        case ViewState.MONTH:
            startDate.setMonth(startDate.getMonth() - 1);
            endDate.setMonth(endDate.getMonth() - 1);
            break;
        case ViewState.YEAR:
            startDate.setFullYear(startDate.getFullYear() - 1);
            endDate.setFullYear(endDate.getFullYear() - 1);
            break;
    }
    updateShownDate();
};

const handleDateForward = () => {
    switch (currentViewState) {
        case ViewState.WEEK:
            startDate.setDate(startDate.getDate() + 7);
            endDate.setDate(endDate.getDate() + 7);
            break;
        case ViewState.MONTH:
            startDate.setMonth(startDate.getMonth() + 1);
            endDate.setMonth(endDate.getMonth() + 1);
            break;
        case ViewState.YEAR:
            startDate.setFullYear(startDate.getFullYear() + 1);
            endDate.setFullYear(endDate.getFullYear() + 1);
            break;
    }
    updateShownDate();
};
