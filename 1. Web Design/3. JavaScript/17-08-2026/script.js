let srno = 1;

function saveForm() {
    let name = document.getElementById("name").value;
    let email = document.getElementById("email").value;
    let tel = document.getElementById("tel").value;

    var table = document.getElementById("table");
    var row = table.insertRow(srno);
    row.insertCell(0).innerHTML = srno;
    row.insertCell(1).innerHTML = name;
    row.insertCell(2).innerHTML = email;
    row.insertCell(3).innerHTML = tel;

    srno++;

    form.reset();
}