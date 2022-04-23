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

const payments = []

app.use(bodyParser.urlencoded({ extended: false }))
app.set('view engine', 'hbs');
app.engine('hbs', handlebars({
    layoutsDir: __dirname + '/views/layouts',
    extname: 'hbs'
}));

app.use(express.static('assets'));
app.use('/assets', express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
    res.render('home');
});

app.get('/success', function (req, res) {
    var query = req.query
    res.json(query);
});

app.get('/failure', function (req, res) {
    var query = req.query
    res.json(query);
});

app.get('/pending', function (req, res) {
    var query = req.query
    res.json(query);
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

    var body = req.body;

    var quantity = Number(req.body.unit)
    var unitPrice = Number(req.body.price)

    req.query.id = req.body.id
    req.query.description = req.body.description
    req.query.title = req.body.title
    req.query.img = req.body.img
    req.query.unit = req.body.unit

    let preference = {
        items: [
            {
                id: body.id,
                title: body.title,
                description: req.body.description,
                picture_url: hostname + req.body.img,
                unit_price: unitPrice,
                quantity: quantity,
                currency_id: "ARS",
                category_id: 'phones',
            }
        ],
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
            req.query.id = response.body.id;
            req.query.init_point = response.body.init_point;
            req.query.price = unitPrice;
            res.render('detail', req.query);
        }).catch(function (error) {
            console.log(error);
        });

});

app.listen(port)
