const express = require('express')
const app = express()
const handlebars = require('express-handlebars');
const path = require('path');
const bodyParser = require('body-parser')
const emailValidator = require('email-validator')
const session = require('express-session');
const port = 3000


app.use(session({
    secret: '52000667',
    resave: false,
    saveUninitialized: true,
}));
app.use(express.static(path.join(__dirname, '/public')));
app.use(bodyParser.urlencoded({ extended: false }))

app.engine('hbs', handlebars.engine({
    defaultLayout: 'main',
    extname: '.hbs',
}))
app.set('view engine', 'hbs');

var products = new Map()
var index = 0;


app.get('/', (req, res) => {
    if (req.session.check === true) {
        res.render('home', { products: products.values() })
    } else {
        res.redirect('login')
    }
})

app.get('/login', (req, res) => {

    if (req.session.check === true) {
        return res.redirect('/')
    }

    res.render('login')
})

app.post('/login', (req, res) => {
    let account = req.body
    let error = '';

    if (!account.email) {
        error = 'Vui lòng nhập email!'
    } else if (!emailValidator.validate(account.email)) {
        error = 'Email không hợp lệ'
    } else if (!account.password) {
        error = 'Vui lòng nhập mật khẩu'
    } else if (account.password.length < 6) {
        error = 'Mật khẩu phải có tối thiểu 6 ký tự'
    } else if (account.email !== 'admin@gmail.com' || account.password != "123456cr") {
        error = 'Sai tài khoản hoặc mật khẩu'
    }

    if (error.length > 0) {
        res.render('login', { errorMessage: error, email: account.email, password: account.password })
    } else {
        req.session.check = true;
        res.redirect('/')
    }
})

app.get('/add', (req, res) => {
    res.render('add', { error: '', name: '', price: '', age: '' })
})

app.post('/add', (req, res) => {
    let data = req.body
    let name = data.name
    let price = data.price
    let desc = data.desc
    let error = ''


    if (!name || name.length == 0) {
        error = 'Bạn chưa nhập tên sản phẩm'
    } else if (!price || price.length == 0) {
        error = 'Bạn chưa nhập giá của sản phẩm'
    } else if (isNaN(price) || parseInt(price) < 0) {
        error = 'Giá sản phẩm bạn nhập vào không phải là số'
    } else if (!desc || desc.length == 0) {
        error = 'Bạn chưa nhập mô tả'
    } 

    if (error) {
        res.render('add', { error, name, price, desc })
    }
    else {
        let product = {
            id: index,
            name: name,
            price: price,
            description: desc,
        }
        products.set(index, product)
        index++
        res.redirect('/')
    }
})

app.get('/chitiet/:id', (req, res) => {
    let id = req.params.id
    let product = products.get(parseInt(id))
    res.render('chitiet', {product})
})

app.get('/edit/:id', (req, res) => {
    let id = req.params.id
    let product = products.get(parseInt(id))
    res.render('edit', { product })
})

app.post('/edit/:id', (req, res) => {
    let data = req.body
    let id = req.params.id

    let product = products.get(parseInt(id))

    product.name = data.name
    product.price = data.price
    product.description = data.description
    products[id] = product

    res.redirect('/')
})

app.post('/delete/:id', (req, res) => {
    let id = req.params.id
    products.delete(parseInt(id))
    index--
    res.redirect('/')
})

app.use((req, res) => {
    res.send('Liên kết này không được hỗ trợ')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})