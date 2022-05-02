// #region Puntos Clave Para la certificación 🥇🥇🥇

// Al generar la preferencia de pago se debe:
// - Enviar la información del ítem que se está comprando. ✔️
// - Enviar los datos del pagador. ✔️
// - Enviar la URL donde se van a recibir las notificaciones de pago. ✔️
// - Enviar external_reference. ✔️
// - Limitar la cantidad de cuotas según lo solicitado. ✔️
// - No ofrecer los medios de pago según lo solicitado. ✔️

// Datos personales del pagador:
// A. Nombre y Apellido: Lalo Landa ✔️
// B. Email: El email del test-user pagador entregado en este documento. ✔️
// C. Código de área: 11 ✔️
// D. Teléfono: ingresar un número celular de tu país ✔️

// Dirección del pagador:
// A. Nombre de la calle: Falsa ✔️
// B. Número de la casa: 123 ✔️
// C. Código postal: ingresa tu código postal ✔️

// Producto
// A partir del producto seleccionado, se deberá enviar el mismo como un ítem de la preferencia de pago:
// A. ID: ingresa 4 dígitos numéricos. ✔️
// B. Nombre del Producto: Nombre del producto seleccionado del carrito del ejercicio. ✔️
// C. Descripción del Producto: “Dispositivo móvil de Tienda e-commerce” ✔️
// D. URL Imagen: Foto del producto seleccionado. (url válida) ✔️
// E. Cantidad: 1 ✔️
// F. Precio: Precio del producto seleccionado. ✔️

// #endregion
var os = require("os");
var hostname = os.hostname();
var express = require('express');
var path = require("path");

var handlebars = require('express-handlebars');
var bodyParser = require('body-parser')
require('dotenv').config()

const mercadopago = require('mercadopago');

mercadopago.configure({
    access_token: process.env.ACCESS_TOKEN,
    integrator_id: process.env.INTEGRATOR_ID,
});

var port = process.env.PORT || 3000
var app = express();

function setExpirationDates(number) {
    var _from = new Date().toISOString();
    var _to = new Date(new Date().getTime() + (number * 24 * 60 * 60 * 1000)).toISOString();

    _from = _from.replace('Z', '-04:00')
    _to = _to.replace('Z', '-04:00')

    return { from: _from, to: _to }
}

function priceToFraction(price) {

    var result = price.toLocaleString('es-ar', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2
    });

    return result;
}

const payments = []
const db = [
    {
        id: 1234,
        description: "Dispositivo móvil de Tienda e-commerce: Samsung Galaxy S9",
        img: "/assets/images/samsung-galaxy-s9-xxl.jpg",
        title: "Samsung Galaxy S9",
        price: 549599,
        unit: 1
    },
    {
        id: 3456,
        description: "Dispositivo móvil de Tienda e-commerce: LG G6",
        img: "/assets/images/l6g6.jpg",
        title: "LG G6",
        price: 25000.50,
        unit: 1
    },
    {
        id: 6456,
        description: "Dispositivo móvil de Tienda e-commerce: iPhone 8",
        img: "/assets/images/u_10168742.jpg",
        title: "iPhone 8",
        price: 116000.99,
        unit: 1
    },
    {
        id: 4567,
        description: "Dispositivo móvil de Tienda e-commerce: Motorola G5",
        img: "/assets/images/motorola-moto-g5-plus-1.jpg",
        title: "Motorola G5",
        price: 38000.50,
        unit: 1
    },
    {
        id: 5678,
        description: "Dispositivo móvil de Tienda e-commerce: Moto G4",
        img: "/assets/images/motorola-moto-g4-3.jpg",
        title: "Moto G4",
        price: 24000.50,
        unit: 1
    },
    {
        id: 4599,
        description: "Dispositivo móvil de Tienda e-commerce: Sony Xperia XZ2",
        img: "/assets/images/003.jpg",
        title: "Sony Xperia XZ2",
        price: 56000,
        unit: 1
    },
    {
        id: 4599,
        description: "Dispositivo móvil de Tienda e-commerce: Asus ROG Phone 5 ZS673KS",
        img: "/assets/images/ZS673KS.png",
        title: "Asus ROG Phone 5 ZS673KS",
        price: 280000,
        unit: 1
    },
    {
        id: 4599,
        description: "Dispositivo móvil de Tienda e-commerce: Xiaomi Redmi Note 11",
        img: "/assets/images/20220423223349.jpg",
        title: "Xiaomi Redmi Note 11",
        price: 55999.99,
        unit: 1
    },

];

app.use(bodyParser.urlencoded({ extended: false }))

app.set('view engine', '.hbs');
app.set("views", path.join(__dirname, "views"));
app.engine('.hbs', handlebars({
    layoutsDir: path.join(app.get("views"), "layouts"),
    partialsDir: path.join(app.get("views"), "partials"),
    extname: '.hbs'
}));

app.use(express.static('assets'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/success', function (req, res) {
    var query = req.query
    
    // res.json(query);
    // query = {
    //     "collection_id": "21874753905",
    //     "collection_status": "approved",
    //     "payment_id": "21874753905",
    //     "status": "approved",
    //     "external_reference": "patricio.e.arena@gmail.com",
    //     "payment_type": "credit_card",
    //     "merchant_order_id": "4617967805",
    //     "preference_id": "469485398-d30a67f4-eebd-40a3-aacd-1c7af487a116",
    //     "site_id": "MLA",
    //     "processing_mode": "aggregator",
    //     "merchant_account_id": "null"
    // }

    // console.log(item);
    res.render('./success/success', query);
});

app.get('/failure', function (req, res) {
    var query = req.query

    // res.json(query);
    // query = {
    //     "collection_id": "21874753905",
    //     "collection_status": "failure",
    //     "payment_id": "21874753905",
    //     "status": "failure",
    //     "external_reference": "patricio.e.arena@gmail.com",
    //     "payment_type": "credit_card",
    //     "merchant_order_id": "4617967805",
    //     "preference_id": "469485398-d30a67f4-eebd-40a3-aacd-1c7af487a116",
    //     "site_id": "MLA",
    //     "processing_mode": "aggregator",
    //     "merchant_account_id": "null"
    // }

    // console.log(item);
    res.render('./failure/failure', query);
});

app.get('/pending', function (req, res) {
    var query = req.query

    // res.json(query);
    // query = {
    //     "collection_id": "21874753905",
    //     "collection_status": "pending",
    //     "payment_id": "21874753905",
    //     "status": "pending",
    //     "external_reference": "patricio.e.arena@gmail.com",
    //     "payment_type": "ticket",
    //     "merchant_order_id": "4617967805",
    //     "preference_id": "469485398-d30a67f4-eebd-40a3-aacd-1c7af487a116",
    //     "site_id": "MLA",
    //     "processing_mode": "aggregator",
    //     "merchant_account_id": "null"
    // }

    // console.log(item);
    res.render('./pending/pending', query);
});

app.get('/payments', function (req, res) {
    res.json(payments);
});

app.post('/notifications', function (req, res) {

    let tempFlag = (req.query.type == 'payment') ? true : false;

    if (tempFlag) {
        let id = req.query['data.id']

        // #region Busqueda por medio de api
        // var options = { method: 'GET',url: `https://api.mercadopago.com/v1/payments/${id}`, headers: { Authorization: `Bearer ${ process.env.ACCESS_TOKEN }`} };
        // request(options, function (error, response) {
        //     if (error) throw new Error(error);
        //     console.log(JSON.parse(response.body));
        //   });
        // #endregion

        var exists = payments.find(obj => obj.id == id);

        if (exists === undefined) {

            mercadopago.payment.findById(id).then(function (response) {
                payments.push(response)
            }).catch(function (error) {
                console.log(error);
            });

        }

    }

    res.status(200)
});

app.post('/detail', function (req, res) {

    var expiration_date = setExpirationDates(2);
    // console.log(expiration_date);

    var host = req.get('host');
    hostname = "https://" + host;

    var notification_url = `${hostname}/notifications`;
    var success_url = `${hostname}/success`;
    var failure_url = `${hostname}/failure`;
    var pending_url = `${hostname}/pending`;

    var item = {
        id: req.body.id,
        title: req.body.title,
        description: req.body.description,
        picture_url: hostname + req.body.img,
        unit_price: Number(req.body.price),
        quantity: Number(req.body.unit),
        currency_id: "ARS",
        category_id: 'phones',
    }

    let preference = {
        items: [item],
        payer: {
            name: "Lalo",
            surname: "Landa",
            email: "test_user_63274575@testuser.com",
            date_created: "2015-06-02T12:58:41.425-04:00",
            phone: {
                area_code: "11",
                number: 33142754
            },

            identification: {
                type: "DNI",
                number: "12345678"
            },

            address: {
                street_name: "Falsa",
                street_number: 123,
                zip_code: "1888"
            }
        },
        back_urls: {
            success: success_url,
            failure: failure_url,
            pending: pending_url
        },
        auto_return: "approved",
        payment_methods: {
            excluded_payment_methods: [
                {
                    id: "visa"
                }
            ],
            excluded_payment_types: [],
            installments: 6
        },
        notification_url: notification_url,
        statement_descriptor: "MINEGOCIO",
        external_reference: "patricio.e.arena@gmail.com",
        expires: true,
        expiration_date: expiration_date.to
    };

    mercadopago.preferences.create(preference)
        .then(function (response) {

            var aux = {
                preference_id: response.body.id,
                init_point: response.body.init_point,
                img: req.body.img,
                fraction: req.body.fraction
            }

            var renderObj = { ...item, ...aux }
            // console.log(response);

            // res.json(response)
            res.render('./detail/detail', renderObj);

        }).catch(function (error) {
            console.log(error);
        });

});

app.get('/', function (req, res) {

    let items = db.map(item => {
        item.fraction = priceToFraction(item.price)
        return item;
    });

    res.render('./home/home', { items });
});

app.listen(port)
