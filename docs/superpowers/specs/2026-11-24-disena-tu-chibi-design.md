# "Diseña tu chibi" y calculadora de costes - Diseño

Aprobado por Jorge el 24/11/2026.

## Intención
El cliente sube su foto, elige opciones, ve su figura chibi generada por IA y un presupuesto con IVA; Jorge recibe un encargo claro con referencia visual. La misma calculadora sirve a Jorge para presupuestar cualquier encargo.

## Calculadora (modelo de 3dfils)
Coste = material + luz + amortización + mantenimiento + mano de obra + extras (packaging).
- Material: gramos × (1 + merma) × precio_bobina / peso_bobina.
- Luz: horas × W / 1000 × €/kWh.
- Amortización: horas × precio_impresora / (meses × 30 × horas_dia).
- Mantenimiento: horas × mantenimiento_mes / (30 × horas_dia).
- Mano de obra: (min preparación + min postprocesado) / 60 × €/h.
- Precio = (coste + extras) × (1 + margen) × (1 + IVA), mínimo por pedido, redondeo a .99.
Parámetros iniciales: impresora 450 €, 24 meses, 8 h/día, mantenimiento 5 €/mes, 120 W, 0,20 €/kWh, PLA 20 €/kg, merma 10 %, 12 €/h, margen 40 %, IVA 21 %, mínimo 5 €.

## Recetas de chibi
| Tamaño | g | h | modelado min | acabado min | packaging € |
| pequeño 8 cm | 18 | 1,2 | 45 | 10 | 0,90 |
| mediano 12 cm | 60 | 2,9 | 45 | 20 | 1,20 |  (dato real del slicer)
| grande 18 cm | 200 | 8 | 60 | 30 | 1,70 |
Extras: personas extra (+60 % de gramos/horas y +30 min por persona), base con nombre (+3 € coste), multicolor (+8 € coste), pintado a mano (+60 min), urgente (+20 % al precio).

## Flujo (cambio pedido por Jorge el 24/11/2026)
- La web NO llama a Gemini ni recibe fotos. El cliente elige opciones, ve el precio con IVA y pulsa "Enviar por WhatsApp": se abre WhatsApp con el resumen y el precio, y adjunta allí su foto.
- Jorge y Mary generan la imagen chibi en Gemini a mano con la plantilla de prompt (docs/prompt-chibi.md) y la envían por WhatsApp.
- Los parámetros de costes viven solo en el backend: la web pública recibe el precio final, nunca el margen.

## Endpoints
- GET /api/v1/presupuestos/chibi?tamano=&personas_extra=&base_nombre=&acabado=&urgente= (público): { precio, opciones }.
- POST /api/v1/presupuestos/calcular (admin): calculadora completa con desglose.
- GET /api/v1/presupuestos/tarifas (admin): parámetros actuales para la calculadora.

## Fuera de alcance
Integración con Gemini, subida de fotos, pago online, panel de pedidos.
