const cName = "Customer";
const id = 1423;
const storeName = "Dukaan!";
const price = [800, 1200, 2000];
const qty = [2, 1, 1];
const billDate = "02/08/2026";

// customer detail printing
document.getElementById('cName').innerHTML = cName;
document.getElementById('Date').innerHTML = billDate;
document.getElementById('id').innerHTML = id;
document.getElementById('storeName').innerHTML = storeName;

// product detail printing
document.getElementById('sprice').innerHTML = price[0];
document.getElementById('jprice').innerHTML = price[1];
document.getElementById('tprice').innerHTML = price[2];

document.getElementById('sqty').innerHTML = qty[0];
document.getElementById('jqty').innerHTML = qty[1];
document.getElementById('tqty').innerHTML = qty[2];

const stotal = price[0] * qty[0];
const jtotal = price[1] * qty[1];
const ttotal = price[2] * qty[2];

document.getElementById('sttl').innerHTML = stotal;
document.getElementById('jttl').innerHTML = jtotal;
document.getElementById('tttl').innerHTML = ttotal;

// checkout total
const subtotal = stotal + jtotal + ttotal;
const disc = subtotal * 20 / 100;
const discAmt = subtotal - disc;
const gst = discAmt * 18 / 100;
const finalAmt = discAmt + gst;

document.getElementById('subtotal').innerHTML = subtotal;
document.getElementById('disc').innerHTML = disc;
document.getElementById('discAmt').innerHTML = discAmt;
document.getElementById('GstAmt').innerHTML = gst;
document.getElementById('finalAmt').innerHTML = finalAmt;