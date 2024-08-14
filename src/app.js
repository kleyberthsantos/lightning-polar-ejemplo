const lightning = require('lightning');
const fs = require('fs');

async function main() {
  const lnd1 = await lightning.authenticatedLndGrpc({
    cert: fs.readFileSync(process.env.LND_CERT_GRACE),
    macaroon: fs.readFileSync(process.env.LND_MACAROON_GRACE),
    socket: '127.0.0.1:10007',
    allow_self_signed: true
  }).lnd;

  const lnd2 = await lightning.authenticatedLndGrpc({
    cert: fs.readFileSync(process.env.LND_CERT_IVAN),
    macaroon: fs.readFileSync(process.env.LND_MACAROON_IVAN),
    socket: '127.0.0.1:10009',
    allow_self_signed: true
  }).lnd;

  async function checkBalance(lnd, nodeName) {
    const { channel_balance } = await lightning.getChannelBalance({lnd});
    console.log(`Balance del canal de ${nodeName}:`, channel_balance);
  }

  await checkBalance(lnd1, 'Grace');
  await checkBalance(lnd2, 'Ivan');

  async function openChannel(lnd1, lnd2, capacity) {
    const { public_key: pubkey } = await lightning.getWalletInfo({lnd: lnd2});
    try {
      const channel = await lightning.openChannel({
        lnd: lnd1,
        local_tokens: capacity,
        partner_public_key: pubkey,
        is_private: false,
      });
      console.log('Canal abierto:', channel);
      return channel;
    } catch (error) {
      console.error('Error al abrir el canal:', error);
    }
  }

  const channel = await openChannel(lnd1, lnd2, 100000);

  if (channel) {
    console.log("Esperando que el canal se active. Por favor, genera algunos bloques en Polar.");
    await new Promise(resolve => setTimeout(resolve, 30000));
    await checkBalance(lnd1, 'Grace');
    await checkBalance(lnd2, 'Ivan');
  }

  const invoice = await lightning.createInvoice({
    lnd: lnd1,
    tokens: 1000,
    description: 'Pago de prueba',
  });
  console.log('Factura creada:', invoice);

  try {
    const payment = await lightning.pay({
      lnd: lnd2,
      request: invoice.request,
    });
    console.log('Pago realizado:', payment);
  } catch (error) {
    console.error('Error al realizar el pago:', error);
  }
}

main().catch(console.error);
