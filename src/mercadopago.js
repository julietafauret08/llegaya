const { MercadoPagoConfig } = require('mercadopago');

module.exports = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});