const storageKey = 'loginRecords';

function getRecords() {
    return JSON.parse(sessionStorage.getItem(storageKey)) || [];
}

function saveLogin(event) {
    event.preventDefault();

    const form = event.target;
    const record = {
        username: form.username.value.trim(),
        email: form.email.value.trim(),
        password: form.password.value,
        submittedAt: new Date().toLocaleString()
    };

    const records = getRecords();
    records.push(record);
    sessionStorage.setItem(storageKey, JSON.stringify(records));
    window.location.href = 'data.html';
}

function showRecords() {
    const body = document.getElementById('loginDataBody');
    const emptyMessage = document.getElementById('emptyMessage');
    const summary = document.getElementById('recordSummary');

    if (!body) return;

    const records = getRecords();
    body.innerHTML = '';
    emptyMessage.hidden = records.length > 0;
    summary.textContent = `${records.length} submitted ${records.length === 1 ? 'record' : 'records'}.`;

    records.forEach(function (record, index) {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${record.username}</td>
            <td>${record.email}</td>
            <td>${'*'.repeat(record.password.length)}</td>
            <td>${record.submittedAt}</td>
        `;
        body.appendChild(row);
    });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) loginForm.addEventListener('submit', saveLogin);

const clearData = document.getElementById('clearData');
if (clearData) {
    clearData.addEventListener('click', function () {
        sessionStorage.removeItem(storageKey);
        showRecords();
    });
}

showRecords();
 