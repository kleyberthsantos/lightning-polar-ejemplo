const lightning = require('lightning');
const fs = require('fs');

async function main() {
  const lnd1 = await lightning.authenticatedLndGrpc({
    cert: fs.readFileSync('/Users/kleysantos/.polar/networks/5/volumes/lnd/grace/tls.cert'),
    macaroon: fs.readFileSync('/Users/kleysantos/.polar/networks/5/volumes/lnd/grace/data/chain/bitcoin/regtest/admin.macaroon'),
    socket: '127.0.0.1:10007',
    allow_self_signed: true
  }).lnd;

  const lnd2 = await lightning.authenticatedLndGrpc({
    cert: fs.readFileSync('/Users/kleysantos/.polar/networks/5/volumes/lnd/ivan/tls.cert'),
    macaroon: fs.readFileSync('/Users/kleysantos/.polar/networks/5/volumes/lnd/ivan/data/chain/bitcoin/regtest/admin.macaroon'),
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
  
  // Intenta abrir un canal si los balances son cero
  const channel = await openChannel(lnd1, lnd2, 100000);
  
  if (channel) {
    console.log("Esperando que el canal se active. Por favor, genera algunos bloques en Polar.");
    // Espera más tiempo para que el canal se active
    await new Promise(resolve => setTimeout(resolve, 30000));

    // Verifica los balances nuevamente
    await checkBalance(lnd1, 'Grace');
    await checkBalance(lnd2, 'Ivan');
  }
  // Crear una factura en el primer nodo
  const invoice = await lightning.createInvoice({
    lnd: lnd1,
    tokens: 1000,
    description: 'Pago de prueba',
  });
  console.log('Factura creada:', invoice);

  // Pagar la factura desde el segundo nodo
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