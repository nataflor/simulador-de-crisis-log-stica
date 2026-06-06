# simulador-de-crisis-logistica

# 📊 Simulador de Crisis Logística — Proyecto Final

* **Título del Proyecto:** Simulador de Crisis Logística - Dashboard Predictivo
* **Enlace de la página web:** 
* **Enlace del repositorio Git:** 

---

## 🌐 1. Introducción General e Interactividad (Criterio: "Página clara, ordenada, interactiva y funcional")

Este proyecto es un **Dashboard Predictivo de Impacto Familiar, Logística Vial y Autonomía de Suministros** diseñado bajo la arquitectura de una **SPA (Single Page Application)**. El sistema funciona como un entorno tecnológico interactivo enfocado en modelar y resolver problemas lógicos y matemáticos cercanos a la realidad nacional (tales como bloqueos de carreteras, escasez de insumos y shocks inflacionarios).

### 🔄 Arquitectura del Sistema Frontend
* **Navegación Dinámica sin Recarga:** La interfaz utiliza un menú inferior elástico. Al hacer clic en cualquiera de los cuatro módulos (*Flujo de Carburantes, Canasta Alimentaria, Desvíos Viales o Balance y Solvencia*), JavaScript intercepta el evento y manipula el árbol de nodos, removiendo u otorgando la clase CSS `.hidden-element` para alternar las pantallas de manera instantánea.
* **Inyección de Casos de Prueba:** El sistema incorpora botones con "Sugerencias para probar". Al ser pulsados, funciones controladas rellenan automáticamente los inputs con escenarios preestablecidos para agilizar la experiencia del usuario y la evaluación docente.
* **Persistencia e Historiales:** Cada simulación procesa los datos y añade en tiempo real una nueva fila al historial del módulo, capturando la estampa de tiempo exacta (`hh:mm:ss p. m.`) directamente desde el sistema.

---

## 🧠 2. Aplicación de Fundamentos de Programación (Criterio: "JavaScript para resolver un problema")

A continuación, se detallan los algoritmos implementados para procesar las variables lógicas y matemáticas de cada problema planteado:

### ⛽ Módulo 1: Flujo de Carburantes (Autonomía de Suministros)
* **El Problema:** Medir el ritmo de vaciado de un tanque de almacenamiento volumétrico cuando el consumo de la población supera al reabastecimiento de las cisternas.
* **Algoritmo Aplicado:**
```javascript
function calcularCarburantes(inventario, consumo, reabastecimiento, umbral) {
    let consumoNeto = reabastecimiento - consumo; // Negativo si hay escasez
    let dias = consumoNeto < 0 ? (inventario - umbral) / Math.abs(consumoNeto) : Infinity;
    
    let estado = "Seguro";
    if (dias <= 3) estado = "Crítico";
    else if (dias <= 10) estado = "Precaución";

    return { consumoNeto, dias: dias.toFixed(1), estado };
}
```


🛒 **Módulo 2: Canasta Alimentaria (Análisis de Precios e Inflación)**
El Problema: Evaluar el impacto acumulativo del sobreprecio de los alimentos básicos y medir cuánta parte del ingreso mensual del hogar es absorbida por la crisis.

Algoritmo Aplicado (Uso de Arreglos Globales):
```javascript
let ListaProductosAlimentosGlobal = [];

function simularCanasta(ingresoMensual) {
    let costoAnterior = 0, costoActual = 0;
    
    ListaProductosAlimentosGlobal.forEach(producto => {
        costoAnterior += producto.precioAnterior * producto.cantidad;
        costoActual += producto.precioActual * producto.cantidad;
    });

    let alzaInflacion = ((costoActual - costoAnterior) / costoAnterior) * 100;
    let porcSueldo = (costoActual / ingresoMensual) * 100;

    return { costoAnterior, costoActual, alzaInflacion: alzaInflacion.toFixed(1), porcSueldo: porcSueldo.toFixed(0) };
}
```


🚗 **Módulo 3: Desvíos Viales (Optimización Logística)**
El Problema: Calcular las horas útiles de vida perdidas al mes y el impacto financiero acumulado (individual y colectivo) cuando el transporte terrestre es desviado por bloqueos viales.

Algoritmo Aplicado:
```javascript
function calcularDesvios(distanciaOrig, distanciaDesv, velOrig, velDesv, costoKm, viajesMes, grupoPersonas) {
    let kmExtra = Math.max(distanciaDesv - distanciaOrig, 0);
    let tiempoOrig = (distanciaOrig / velOrig) * 60;
    let tiempoDesv = (distanciaDesv / velDesv) * 60;
    
    let minsPerdidosViaje = Math.max(tiempoDesv - tiempoOrig, 0);
    let gastoMensualInd = kmExtra * costoKm * viajesMes;
    let horasPerdidasGrupo = ((minsPerdidosViaje * viajesMes) / 60) * grupoPersonas;

    return { kmExtra, gastoMensualInd, gastoTotalGrupo: gastoMensualInd * grupoPersonas, horasPerdidasGrupo: horasPerdidasGrupo.toFixed(1) };
}
```


💵 **Módulo 4: Balance y Solvencia (Auditoría Presupuestaria de Shock)**
El Problema: Someter las finanzas a un test de estrés indexando un porcentaje de shock inflacionario imprevisto a los gastos fijos para determinar la capacidad de resiliencia económica.

Algoritmo Aplicado (Estructuras Condicionales Anidadas):
```javascript
function evaluarSolvencia(fondos, gastoBase, shock) {
    let gastoFinal = gastoBase * (1 + (shock / 100));
    let ratio = (gastoFinal / fondos) * 100;
    
    let diagnostico = "Solvencia Financiera ✅";
    if (ratio > 100) diagnostico = "Insolvencia Crítica 🚨";
    else if (ratio > 85) diagnostico = "Riesgo Técnico ⚠️";

    return { gastoFinal, saldoRemanente: fondos - gastoFinal, diagnostico };
}
```


⚡ **3. Manipulación Dinámica del DOM (Criterio: "Manipular el DOM para mostrar resultados")**

El proyecto cumple estrictamente con el control dinámico de la interfaz sin herramientas de renderizado externo, utilizando JavaScript puro:

-Lectura de Datos: Captura selectiva de formularios mediante métodos de selección de nodos y conversión de tipos con parseFloat() y parseInt().

-Renderizado de Tablas Dinámicas: Inyección asíncrona de filas HTML (<tr>, <td>) mediante propiedades innerHTML para estructurar la lista detallada de precios e historiales cronológicos.

-Visualización de Datos con Librerías: Integración y control síncrono de Chart.js para renderizar gráficos de barras comparativos (Gasto Base vs Gasto con Crisis), facilitando la lectura estadística de las proyecciones.



🎨 **4. Maquetación y Responsividad ("Estructurar con HTML5 y diseñar con CSS responsivo")**

-HTML5 Semántico: Organización jerárquica estructurada mediante etiquetas estructurales nativas:
```(<header>, <main>, <section>, <footer>)```, garantizando un documento limpio y de fácil lectura para los navegadores.

-CSS Grid Layout: Implementado en el menú y panel de selectores principales del Dashboard, utilizando la propiedad elástica repeat(auto-fit, minmax(...)) para lograr una adaptación bidimensional perfecta a cualquier resolución de pantalla.

-Flexbox Layout: Utilizado para la alineación unidimensional de los formularios de entrada de datos, las tarjetas de KPIs y las filas de reportes financieros.

-Identidad Visual: Estética vibrante Synthwave que emplea una paleta de colores de fondo oscuros con acentos neón magenta y cyan para resaltar las métricas e indicadores de riesgo.

📂 5. Estructura Organizada del Repositorio
```
├── index.html            # Documento raíz (Estructura general y SPA)
├── estilos/
│   └── styles.css        # Hoja de estilos (Maquetación Grid/Flex, animaciones y diseño responsivo)
├── java/
│   └── script.js         # Motor lógico de la aplicación (Algoritmos, eventos y control del DOM)
└── README.md             # Documentación técnica y académica del software
