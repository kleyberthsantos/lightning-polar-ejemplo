# Lightning Network Polar Ejemplo

Este proyecto demuestra cómo interactuar con nodos Lightning Network utilizando Polar como entorno de desarrollo.

## Prerequisitos

- Node.js (v14 o superior)
- [Polar](https://lightningpolar.com/)

## Instalación

1. Clona este repositorio:

  git clone https://github.com/kleyberthsantos/lightning-polar-ejemplo.git
  cd lightning-polar-ejemplo

2. Instala las dependencias:

  npm install

## Configuración de Polar

1. Abre Polar y crea una nueva red con al menos dos nodos LND.
2. Asegúrate de que los nodos tengan fondos y que haya un canal abierto entre ellos.
3. Genera algunos bloques para activar el canal.

## Ejecución

1. Actualiza las rutas de los certificados y macaroons en `src/app.js` para que coincidan con tu configuración de Polar.
2. Ejecuta el script:
  node src/app.js

## Qué hace este script

1. Se conecta a dos nodos LND configurados en Polar.
2. Verifica los balances de los canales.
3. Crea una factura en un nodo.
4. Paga la factura desde el otro nodo.

## Recursos adicionales

- [Repositorio de Polar](https://github.com/jamaljsr/polar)
- [Lightning Network Developer Resources](https://dev.lightning.community/)

## Contribuir

Las contribuciones son bienvenidas. Por favor, abre un issue o un pull request para cambios y mejoras.

## Licencia

MIT - ver el archivo [LICENSE](LICENSE) para más detalles.