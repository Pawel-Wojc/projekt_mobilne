

startDate = new Date();
endDate = new Date();

let financeRecords = [];

const ViewState = {
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year',
};

let currentViewState;

const monthButton = document.getElementById('month-button');
const weekButton = document.getElementById('week-button');
const yearButton = document.getElementById('year-button');


const getSummaryFromApi = async () => {
    const userKey = localStorage.getItem('myKey');
    try {
        fetch(`http://localhost:3000/api/summary?userKey=${userKey}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        }).then((response) => response.json()).then((result) => {
            financeRecords = result;
            presentSummary(getRecordsFromRange(startDate, endDate));

        });
    } catch (error) {
        console.error('Błąd podczas pobierania podsumowania:', error);
    }
};
getSummaryFromApi();


updateStartEndDate = () => {
    switch (currentViewState) {
        case ViewState.WEEK:
            const now = new Date();
            const day = now.getDay() || 7;

            startDate = new Date(now);
            startDate.setDate(now.getDate() - day + 1);
            startDate.setHours(0, 0, 0, 0);

            endDate = new Date(now);
            endDate.setDate(now.getDate() + (7 - day));
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



const getRecordsFromRange = (startDate, endDate) => {
    const filteredRecords = financeRecords.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
    });
    return filteredRecords;
};



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
const formatDate = (date) => {
    const dateObj = new Date(date);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


const presentSummary = (recordsToShow) => {
    summaryTotal = document.getElementById('summary-total');
    totalAmount = 0;
    summaryList = document.getElementById("entry-history-container")
    summaryList.innerHTML = '';
    let builder = '';
    recordsToShow.forEach((record) => {
        totalAmount += parseFloat(record.value);
        builder += `<div class="entry ${record.value > 0 ? "green" : "red"}">
                <p class="entry-date">${formatDate(record.date)}</p>
                <div class="entry-details">
                    <h2>${record.value.toFixed(2)}</h2>
                    <span>${record.desc}</span>
                </div>
            </div>`;
    });

    if (recordsToShow.length === 0) {
        builder = `<div class="entry">
                <div class="entry-details">
                    <span>Brak danych</span>
                    <h2>0.00</h2>
                    
                </div>
            </div>`;
    }
    summaryList.innerHTML = builder;
    summaryTotal.innerHTML = `Suma : ${totalAmount.toFixed(2)}`;
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
    presentSummary(getRecordsFromRange(startDate, endDate));
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
    presentSummary(getRecordsFromRange(startDate, endDate));
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

    return months[monthNumber] || null;
}