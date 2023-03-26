walletTo = '0.0.9669'
walletFrom = '0.0.420420'
amount = '54321'

fetch(`http://10.0.0.4:42069/send-message?walletTo=${walletTo}&walletFrom=${walletFrom}&amount=${amount}`)
.then( res => console.log(res));

// fetch('http://10.30.78.28:42069/test')
// .then(data => console.log(data))