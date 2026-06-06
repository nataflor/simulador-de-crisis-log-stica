let InstanciaGraficoCarburantes = null;
let InstanciaGraficoAlimentos = null;
let InstanciaGraficoTransporte = null;
let InstanciaGraficoPresupuesto = null;

let ListaProductosAlimentosGlobal = [];

function irModulo(llaveModulo) {
    document.getElementById('pantalla-inicio').classList.add('hidden-element');
    document.getElementById('wrapper-regresar').classList.remove('hidden-element');
    
    document.querySelectorAll('.core-module').forEach(m => m.classList.add('hidden-element'));
    ocultarTodosLosPanelesDesglose();

    if(llaveModulo === 'carburantes') document.getElementById('area-carburantes').classList.remove('hidden-element');
    if(llaveModulo === 'alimentos') document.getElementById('area-alimentos').classList.remove('hidden-element');
    if(llaveModulo === 'transporte') document.getElementById('area-transporte').classList.remove('hidden-element');
    if(llaveModulo === 'presupuesto') document.getElementById('area-presupuesto').classList.remove('hidden-element');
}

function volverAlInicioGlobal() {
    document.getElementById('pantalla-inicio').classList.remove('hidden-element');
    document.getElementById('wrapper-regresar').classList.add('hidden-element');
    document.querySelectorAll('.core-module').forEach(m => m.classList.add('hidden-element'));
    ocultarTodosLosPanelesDesglose();
}

function ocultarTodosLosPanelesDesglose() {
    document.getElementById('carb-desglose-panel').classList.add('hidden-element');
    document.getElementById('ali-desglose-panel').classList.add('hidden-element');
    document.getElementById('trans-desglose-panel').classList.add('hidden-element');
    document.getElementById('pres-desglose-panel').classList.add('hidden-element');
}

function conmutarModoLuz() {
    document.body.classList.toggle('light-mode');
}

function inyectarCasoCarburantes(num) {
    if(num===1) setupCamposCarburantes(15000, 1000, 1000, 2000);
    if(num===2) setupCamposCarburantes(12000, 1400, 400, 2500);
    if(num===3) setupCamposCarburantes(10000, 2500, 300, 3000);
    ocultarTodosLosPanelesDesglose();
}

function setupCamposCarburantes(i,c,r,cr) {
    document.getElementById('c-inicial').value = i;
    document.getElementById('c-consumo').value = c;
    document.getElementById('c-reabast').value = r;
    document.getElementById('c-critico').value = cr;
}

function calcularCarburantes() {
    const ri = parseFloat(document.getElementById('c-inicial').value);
    const cd = parseFloat(document.getElementById('c-consumo').value);
    const rd = parseFloat(document.getElementById('c-reabast').value);
    const uc = parseFloat(document.getElementById('c-critico').value);

    if(isNaN(ri) || isNaN(cd) || isNaN(rd) || isNaN(uc)) { alert("Por favor complete todos los campos numéricos."); return; }

    let dif = cd - rd;
    let auto = dif > 0 ? (ri - uc) / dif : 99;
    if (auto < 0) auto = 0;

    let estado = "Estable"; let tagClase = "risk-estat-est";
    if (auto === 0) { estado = "Agotado"; tagClase = "risk-estat-ago"; }
    else if (auto < 7) { estado = "Crítico"; tagClase = "risk-estat-cri"; }
    else if (auto <= 15) { estado = "Precaución"; tagClase = "risk-estat-pre"; }

    let pctTanque = Math.min(Math.max((ri / 15000) * 100, 0), 100);
    let bloques = Math.round(pctTanque / 10);
    let visualTanque = "█".repeat(bloques) + "░".repeat(10 - bloques);

    document.getElementById('carb-kpis').innerHTML = `
        <div class="kpi-container">
            <div class="kpi-card"><span>Inventario</span><h5>${ri.toLocaleString()} L</h5></div>
            <div class="kpi-card"><span>Consumo Neto</span><h5>-${dif} L/día</h5></div>
            <div class="kpi-card"><span>Autonomía</span><h5>${auto.toFixed(1)} Días</h5></div>
            <div class="kpi-card"><span>Estado</span><h5>${estado}</h5></div>
        </div>
        <p class="texto-por-que"><strong>¿Por qué sale esto?:</strong> Como se consume más de lo que ingresa, pierdes <b>${dif} litros diarios</b>, reduciendo el tiempo de reserva segura a solo <b>${auto.toFixed(1)} días</b>.</p>
        <div class="risk-tag ${tagClase}">Panel de Riesgo: Sistema Operativo en nivel [${estado}]</div>
    `;

    document.getElementById('carb-tanque-visual').innerHTML = `
        <div class="tanque-representacion">
            🛢️ Capacidad del Tanque: ${visualTanque} ${pctTanque.toFixed(0)}%
        </div>
        <p class="texto-por-que"><strong>¿Qué indica?:</strong> Muestra que el tanque físico está al <b>${pctTanque.toFixed(0)}%</b>; un nivel bajo te deja sin margen ante retrasos de cisternas.</p>
    `;

    document.getElementById('carb-progreso').innerHTML = `
        <p style="font-size:0.75rem; margin-bottom:4px; color:#94a3b8;">Nivel de seguridad hasta umbral crítico:</p>
        <div class="progress-track"><div class="progress-fill-bar" style="width: ${pctTanque}%;"></div></div>
        <p class="texto-por-que"><strong>¿Qué significa?:</strong> Al avanzar a la izquierda, avisa que estás consumiendo el inventario mínimo de emergencia reservado para vehículos prioritarios.</p>
    `;

    document.getElementById('carb-conclusion').innerHTML = `
        <div class="ai-conclusion">
            <strong>Conclusión Automática:</strong> Con los datos analizados, el almacenamiento alcanzará su punto de alarma crítico en aproximadamente <strong>${auto.toFixed(2)} días</strong>. El ritmo de abastecimiento actual no logra balancear la fricción de consumo diario.
        </div>
    `;

    let filasHtml = "";
    let balanceCorriente = ri;
    let arrayGraficoLabels = [];
    let arrayGraficoDatos = [];
    let arrayCriticoDatos = [];

    for(let d = 1; d <= 7; d++) {
        balanceCorriente = Math.max(balanceCorriente - dif, 0);
        filasHtml += `<tr><td>Día ${d}</td><td>${balanceCorriente.toFixed(0)} L</td><td>${balanceCorriente > uc ? '✅ Seguro' : '⚠️ Crítico'}</td></tr>`;
        arrayGraficoLabels.push(`Día ${d}`);
        arrayGraficoDatos.push(balanceCorriente);
        arrayCriticoDatos.push(uc);
    }

    document.getElementById('carb-explicacion-grafico').innerHTML = `
        <p class="texto-por-que"><strong>¿Qué muestra la línea?:</strong> La caída marca el declive del combustible; el punto donde cruza la línea roja discontinua es el día exacto del desabastecimiento.</p>
    `;

    document.getElementById('carb-tabla-contenedor').innerHTML = `
        <h4 class="sub-table-title">📅 Lista de Evolución Temporal de Reservas Diarias</h4>
        <p class="texto-por-que"><strong>¿De qué trata?:</strong> Cronograma que mide los litros diarios restantes para saber cuándo aplicar racionamientos o restricciones de venta.</p>
        <table class="sub-table"><thead><tr><th>Período</th><th>Reserva Estimada</th><th>Condición</th></tr></thead><tbody>${filasHtml}</tbody></table>
    `;

    let registro = { fecha: new Date().toLocaleTimeString(), res: ri, con: cd, resu: auto.toFixed(1) + " días" };
    let historial = JSON.parse(localStorage.getItem('h_carb') || '[]');
    historial.unshift(registro);
    localStorage.setItem('h_carb', JSON.stringify(historial.slice(0, 3)));

    let filasHistorial = historial.slice(0,3).map(h => `<tr><td>${h.fecha}</td><td>${h.res} L</td><td>${h.con} L/d</td><td>${h.resu}</td></tr>`).join('');
    document.getElementById('carb-historial-contenedor').innerHTML = `
        <h4 class="sub-table-title">🕒 Historial de Últimas Simulaciones Registradas</h4>
        <table class="sub-table"><thead><tr><th>Hora</th><th>Reserva</th><th>Consumo</th><th>Resultado</th></tr></thead><tbody>${filasHistorial}</tbody></table>
    `;

    document.getElementById('carb-desglose-panel').classList.remove('hidden-element');
    setTimeout(() => {
        let ctx = document.getElementById('chartCarb').getContext('2d');
        if(InstanciaGraficoCarburantes) InstanciaGraficoCarburantes.destroy();
        InstanciaGraficoCarburantes = new Chart(ctx, {
            type: 'line',
            data: {
                labels: arrayGraficoLabels,
                datasets: [
                    { label: 'Línea de Reserva Real', data: arrayGraficoDatos, borderColor: '#06b6d4', tension: 0.2, fill: false },
                    { label: 'Nivel Crítico de Alerta', data: arrayCriticoDatos, borderColor: '#ef4444', borderDash: [6, 4], fill: false }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }, 40);
}

function shortcutAlimentoInyeccion(nom, v, ant, act) {
    document.getElementById('a-insumo').value = nom;
    document.getElementById('a-volumen').value = v;
    document.getElementById('a-ant').value = ant;
    document.getElementById('a-act').value = act;
}

function inyectarEscenarioAlimentos(caso) {
    ListaProductosAlimentosGlobal = [];
    ocultarTodosLosPanelesDesglose();
    if(caso === 'uno') {
        shortcutAlimentoInyeccion('Papa (Arroba)', 3, 45, 80);
    } else if(caso === 'dos') {
        ListaProductosAlimentosGlobal.push({ nombre: 'Arroz (Kilo)', vol: 12, antes: 6, ahora: 11 });
        shortcutAlimentoInyeccion('Aceite (Litro)', 4, 13, 22);
    }
}

function agregarProductoAlimentos() {
    if (ListaProductosAlimentosGlobal.length >= 10) {
        alert("Límite alcanzado. Solo se pueden evaluar hasta 10 productos simultáneamente.");
        return;
    }

    let n = document.getElementById('a-insumo').value.trim();
    let v = parseFloat(document.getElementById('a-volumen').value);
    let ant = parseFloat(document.getElementById('a-ant').value);
    let act = parseFloat(document.getElementById('a-act').value);

    if(!n || isNaN(v) || isNaN(ant) || isNaN(act)) { alert("Por favor complete todos los datos del alimento antes de añadir."); return; }
    
    ListaProductosAlimentosGlobal.push({ nombre: n, vol: v, antes: ant, ahora: act });
    
    document.getElementById('a-insumo').value = "";
    document.getElementById('a-volumen').value = "";
    document.getElementById('a-ant').value = "";
    document.getElementById('a-act').value = "";

    alert("Producto añadido a la lista interna. Presione 'Ejecutar Simulación de la Canasta' para procesar los cambios.");
}

function calcularAlimentos() {
    const salario = parseFloat(document.getElementById('a-salario').value) || 2500;
    
    let n = document.getElementById('a-insumo').value.trim();
    let v = parseFloat(document.getElementById('a-volumen').value);
    let ant = parseFloat(document.getElementById('a-ant').value);
    let act = parseFloat(document.getElementById('a-act').value);

    if(n && !isNaN(v) && !isNaN(ant) && !isNaN(act)) {
        ListaProductosAlimentosGlobal.push({ nombre: n, vol: v, antes: ant, ahora: act });
        document.getElementById('a-insumo').value = "";
        document.getElementById('a-volumen').value = "";
        document.getElementById('a-ant').value = "";
        document.getElementById('a-act').value = "";
    }

    if(ListaProductosAlimentosGlobal.length === 0) {
        alert("Introduzca datos de un alimento válido o añada uno a la lista primero.");
        return;
    }

    let costoTotalAnterior = 0;
    let costoTotalActual = 0;
    let filasProductos = "";
    let labelsGrafico = [];
    let datosGraficoAnterior = [];
    let datosGraficoActual = [];
    let desgloseTextoProductos = "";

    ListaProductosAlimentosGlobal.forEach(p => {
        let subAnt = p.antes * p.vol;
        let subAct = p.ahora * p.vol;
        costoTotalAnterior += subAnt;
        costoTotalActual += subAct;
        
        filasProductos += `<tr><td>${p.nombre}</td><td>${p.vol} u/kg</td><td>${p.antes.toFixed(1)} Bs</td><td>${p.ahora.toFixed(1)} Bs</td><td>${subAnt.toFixed(0)} Bs</td><td>${subAct.toFixed(0)} Bs</td></tr>`;
        
        labelsGrafico.push(p.nombre);
        datosGraficoAnterior.push(subAnt);
        datosGraficoActual.push(subAct);

        let diferenciaIndividual = subAct - subAnt;
        desgloseTextoProductos += `• <b>${p.nombre}</b>: Antes gastabas ${subAnt.toFixed(0)} Bs y ahora gastas <b>${subAct.toFixed(0)} Bs</b> (Pagas <b>+${diferenciaIndividual.toFixed(0)} Bs extra</b> por la escasez).<br>`;
    });

    let variacionAbsoluta = costoTotalActual - costoTotalAnterior;
    let inflacionCanasta = (variacionAbsoluta / costoTotalAnterior) * 100;
    let absorcionSalario = (costoTotalActual / salario) * 100;

    let estado = "Estable"; let tagClase = "risk-estat-est";
    if(absorcionSalario > 50) { estado = "Crítico"; tagClase = "risk-estat-cri"; }
    else if(absorcionSalario > 30) { estado = "Precaución"; tagClase = "risk-estat-pre"; }

    let textoPorQueGlobal = "";
    if (ListaProductosAlimentosGlobal.length === 1) {
        let pUnico = ListaProductosAlimentosGlobal[0];
        textoPorQueGlobal = `<strong>¿Por qué sale esto?:</strong> Tu gasto en <b>${pUnico.nombre}</b> subió de ${costoTotalAnterior.toFixed(0)} Bs a <b>${costoTotalActual.toFixed(0)} Bs</b> debido a la crisis. Esto significa que pagas un <b>+${inflacionCanasta.toFixed(1)}% extra</b> y este único alimento se traga el <b>${absorcionSalario.toFixed(0)}%</b> de todo tu sueldo mensual.`;
    } else {
        textoPorQueGlobal = `<strong>¿Por qué sale esto en general?:</strong> Sumando todos tus productos ingresados, tu mercado pasó de costar ${costoTotalAnterior.toFixed(0)} Bs a valer <b>${costoTotalActual.toFixed(0)} Bs</b>. En total, la comida subió un <b>+${inflacionCanasta.toFixed(1)}%</b> y te obliga a usar el <b>${absorcionSalario.toFixed(0)}%</b> de tu salario solo en comer.<br><br><strong>Impacto separado por cada producto:</strong><br>${desgloseTextoProductos}`;
    }

    document.getElementById('ali-kpis').innerHTML = `
        <div class="kpi-container">
            <div class="kpi-card"><span>Antes de la Crisis</span><h5>${costoTotalAnterior.toFixed(0)} Bs</h5></div>
            <div class="kpi-card"><span>Precio de Hoy</span><h5>${costoTotalActual.toFixed(0)} Bs</h5></div>
            <div class="kpi-card"><span>Cuánto Subió</span><h5>+${inflacionCanasta.toFixed(1)}%</h5></div>
            <div class="kpi-card"><span>% Del Sueldo Usado</span><h5>${absorcionSalario.toFixed(0)}%</h5></div>
        </div>
        <p class="texto-por-que">${textoPorQueGlobal}</p>
        <div class="risk-tag ${tagClase}">Poder de compra familiar: [${estado}]</div>
    `;

    document.getElementById('ali-conclusion').innerHTML = `
        <div class="ai-conclusion">
            <strong>Resumen Claro:</strong> Comprar estos alimentos te cuesta ahora <strong>${costoTotalActual.toFixed(0)} Bs</strong> en vez de los ${costoTotalAnterior.toFixed(0)} Bs de antes. Estás perdiendo exactamente <strong>${variacionAbsoluta.toFixed(0)} Bs</strong> libres que pudiste usar para otros gastos de tu casa.
        </div>
    `;

    document.getElementById('ali-explicacion-grafico').innerHTML = `
        <p class="texto-por-que"><strong>¿Cómo leer las barras?:</strong> La barra azul es lo que pagabas normalmente y la rosa es el precio inflado actual. Cuanto más alta sea la rosa, más caro e inaccesible se volvió ese alimento.</p>
    `;

    document.getElementById('ali-tabla-contenedor').innerHTML = `
        <h4 class="sub-table-title">📋 Lista Detallada de Precios Basada en los Alimentos Ingresados</h4>
        <p class="texto-por-que"><strong>¿Qué detalla?:</strong> Compara el costo unitario y total por producto para identificar cuáles dañan más tu bolsillo y requieren reducir su consumo.</p>
        <table class="sub-table"><thead><tr><th>Alimento</th><th>Cantidad</th><th>Precio Ant. u.</th><th>Precio Act. u.</th><th>Total Regular</th><th>Total con Crisis</th></tr></thead><tbody>${filasProductos}</tbody></table>
    `;

    document.getElementById('ali-desglose-panel').classList.remove('hidden-element');

    setTimeout(() => {
        let ctx = document.getElementById('chartAli').getContext('2d');
        if(InstanciaGraficoAlimentos) InstanciaGraficoAlimentos.destroy();
        InstanciaGraficoAlimentos = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labelsGrafico,
                datasets: [
                    { label: 'Precio Antiguo (Bs)', data: datosGraficoAnterior, backgroundColor: '#06b6d4' },
                    { label: 'Precio con Crisis (Bs)', data: datosGraficoActual, backgroundColor: '#ec4899' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }, 40);
}

function limpiarAlimentos() {
    ListaProductosAlimentosGlobal = [];
    document.getElementById('a-insumo').value = "";
    document.getElementById('a-volumen').value = "";
    document.getElementById('a-ant').value = "";
    document.getElementById('a-act').value = "";
    document.getElementById('ali-desglose-panel').classList.add('hidden-element');
    alert("Lista de la canasta vaciada con éxito.");
}

function cargarEscenarioTransporte(o,d,c,v,vel,per) {
    document.getElementById('t-original').value = o;
    document.getElementById('t-desvio').value = d;
    document.getElementById('t-costo').value = c;
    document.getElementById('t-viajes').value = v;
    document.getElementById('t-velocidad').value = vel;
    document.getElementById('t-personas').value = per;
    ocultarTodosLosPanelesDesglose();
}

function calcularTransporte() {
    let o = parseFloat(document.getElementById('t-original').value);
    let d = parseFloat(document.getElementById('t-desvio').value);
    let c = parseFloat(document.getElementById('t-costo').value);
    let v = parseFloat(document.getElementById('t-viajes').value);
    let vel = parseFloat(document.getElementById('t-velocidad').value) || 40;
    let per = parseFloat(document.getElementById('t-personas').value) || 1;

    if(isNaN(o) || isNaN(d) || isNaN(c) || isNaN(v) || isNaN(per)) { alert("Por favor complete todos los datos viales."); return; }

    let kmExtra = Math.max(d - o, 0);
    let sobrecostoViajeIndividual = kmExtra * c;
    let sobrecostoMesIndividual = sobrecostoViajeIndividual * v;
    let sobrecostoMesGrupoTotal = sobrecostoMesIndividual * per;

    let tiempoOriginal = (o / vel) * 60;
    let tiempoDesvio = (d / vel) * 60;
    let tiempoPerdidoViaje = Math.max(tiempoDesvio - tiempoOriginal, 0);
    let tiempoPerdidoMesTotalGrupo = ((tiempoPerdidoViaje * v) / 60) * per;

    let tipoSujeto = (per >= 2) ? "Colectiva" : "Individual";
    let nivelRiesgo = sobrecostoMesGrupoTotal > 2000 ? "Crítico" : "Moderado";
    let claseRiesgo = sobrecostoMesGrupoTotal > 2000 ? "risk-estat-cri" : "risk-estat-pre";

    let explicacionViajesText = "";
    if (per === 1) {
        explicacionViajesText = `<strong>¿Por qué sale esto?:</strong> Como la ruta directa está bloqueada, tienes que dar una vuelta larguísima recorriendo <b>${kmExtra} km extras</b> por viaje. Esto te hace gastar un adicional de <b>${sobrecostoMesIndividual.toFixed(0)} Bs de combustible al mes</b> y te quita un total de <b>${tiempoPerdidoMesTotalGrupo.toFixed(1)} horas</b> de tu vida atrapado manejando en desvíos.`;
    } else {
        explicacionViajesText = `<strong>¿Por qué sale esto en general?:</strong> El desvío de <b>${kmExtra} km</b> afecta a un grupo entero de <b>${per} personas</b>. Individualmente cada uno pierde ${sobrecostoMesIndividual.toFixed(0)} Bs, pero sumando el impacto de toda la flota o negocio, se desperdicia un total masivo de <b>${sobrecostoMesGrupoTotal.toLocaleString()} Bs al mes</b> y se pierden <b>${tiempoPerdidoMesTotalGrupo.toFixed(1)} horas combinadas</b> de tiempo operativo útil.`;
    }

    document.getElementById('trans-kpis').innerHTML = `
        <div class="kpi-container">
            <div class="kpi-card"><span>Km Extras por Vuelta</span><h5>+${kmExtra} Km</h5></div>
            <div class="kpi-card"><span>Gasto Extra de 1 Persona</span><h5>${sobrecostoMesIndividual.toFixed(0)} Bs</h5></div>
            <div class="kpi-card"><span>Gasto Total del Grupo</span><h5>${sobrecostoMesGrupoTotal.toLocaleString()} Bs</h5></div>
            <div class="kpi-card"><span>Tiempo Perdido en el Mes</span><h5>${tiempoPerdidoMesTotalGrupo.toFixed(1)} hrs</h5></div>
        </div>
        <p class="texto-por-que">${explicacionViajesText}</p>
        <div class="risk-tag ${claseRiesgo}">Condición de Operación Logística ${tipoSujeto}: [${nivelRiesgo}]</div>
    `;

    document.getElementById('trans-mapa-svg').innerHTML = `
        <div style="background:#161929; padding:20px; border-radius:12px; border:1px solid #262b44; text-align:center; margin-bottom:15px; box-shadow: inset 0 0 10px rgba(0,0,0,0.5);">
            <p style="font-size:0.8rem; color:#06b6d4; font-weight:600; margin-bottom:12px; text-transform:uppercase; letter-spacing:0.5px;">Esquema Visual de la Disrupción Logística por Bloqueo</p>
            <svg viewBox="0 0 320 100" style="width:100%; max-width:420px; display:inline-block; vertical-align:middle;">
                <defs>
                    <marker id="flecha" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#06b6d4"/>
                    </marker>
                    <marker id="flecha-desvio" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                        <path d="M 0 1 L 10 5 L 0 9 z" fill="#ec4899"/>
                    </marker>
                </defs>
                <line x1="20" y1="70" x2="135" y2="70" stroke="#06b6d4" stroke-width="3" marker-end="url(#flecha)" />
                <line x1="165" y1="70" x2="290" y2="70" stroke="#06b6d4" stroke-width="3" />
                <circle cx="150" cy="70" r="14" fill="#ef4444" fill-opacity="0.2" stroke="#ef4444" stroke-width="2" />
                <text x="145" y="74" fill="#ef4444" font-size="12" font-weight="bold">🛑</text>
                <path d="M 40 70 Q 150 15 260 70" fill="none" stroke="#ec4899" stroke-width="2.5" stroke-dasharray="5,4" marker-end="url(#flecha-desvio)" />
                <text x="105" y="25" fill="#f472b6" font-size="11" font-weight="bold" font-family='Courier New',monospace>⚠️ Desvío Obligatorio</text>
                <text x="15" y="92" fill="#94a3b8" font-size="9">Origen</text>
                <text x="270" y="92" fill="#94a3b8" font-size="9">Destino</text>
            </svg>
        </div>
    `;

    document.getElementById('trans-conclusion').innerHTML = `
        <div class="ai-conclusion">
            <strong>Resumen de Ruta:</strong> Quedarse atascado o dar rodeos cuesta caro. Esta simulación demuestra que las trancas o bloqueos viales no solo destruyen la planificación horaria de los conductores, sino que causan una pérdida monetaria directa e inmediata por el gasto excesivo de nafta/diésel.
        </div>
    `;

    document.getElementById('trans-explicacion-grafico').innerHTML = `
        <p class="texto-por-que"><strong>¿Cómo leer las barras?:</strong> La barra verde es el tiempo que tardas normalmente en minutos sin bloqueos. La barra roja es el tiempo total acumulado tomando la ruta alternativa. Cuanto más alta la roja, peor es el embotellamiento o desvío.</p>
    `;

    let filasT = "";
    let tramosExtra = [5, 15, 30, 50];
    tramosExtra.forEach(tKm => {
        let costoSimMesInd = (tKm * c) * v;
        let costoSimMesGrp = costoSimMesInd * per;
        filasT += `<tr><td>+${tKm} Km adicionales</td><td>${per} hab.</td><td>${costoSimMesGrp.toLocaleString()} Bs/mes</td></tr>`;
    });

    document.getElementById('trans-tabla-contenedor').innerHTML = `
        <h4 class="sub-table-title">📈 Lista de Escalabilidad: Pérdida de Dinero según los Kilómetros del Desvío</h4>
        <p class="texto-por-que"><strong>¿De qué trata?:</strong> Proyecta el impacto económico si las rutas alternativas se alargan más, ayudando a ver cuándo deja de ser rentable el transporte.</p>
        <table class="sub-table"><thead><tr><th>Distancia Extra Proyectada</th><th>Población Evaluada</th><th>Pérdida Económica Total</th></tr></thead><tbody>${filasT}</tbody></table>
    `;

    document.getElementById('trans-desglose-panel').classList.remove('hidden-element');

    setTimeout(() => {
        let ctx = document.getElementById('chartTrans').getContext('2d');
        if(InstanciaGraficoTransporte) InstanciaGraficoTransporte.destroy();
        InstanciaGraficoTransporte = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Ruta Corta Normal', 'Ruta Larga con Desvío'],
                datasets: [{ label: 'Minutos Totales de Viaje', data: [tiempoOriginal, tiempoDesvio], backgroundColor: ['#10b981', '#ef4444'] }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }, 40);
}

function cargarPerfilPresupuesto(f,g,s) {
    document.getElementById('p-fondos').value = f;
    document.getElementById('p-gasto').value = g;
    document.getElementById('p-shock').value = s;
    ocultarTodosLosPanelesDesglose();
}

function calcularPresupuesto() {
    let fondos = parseFloat(document.getElementById('p-fondos').value);
    let gastoBase = parseFloat(document.getElementById('p-gasto').value);
    let shock = parseFloat(document.getElementById('p-shock').value) || 0;

    if(isNaN(fondos) || isNaN(gastoBase)) { alert("Por favor introduzca los fondos and gastos base."); return; }

    let incrementoPorShock = gastoBase * (shock / 100);
    let gastoFinalConCrisis = gastoBase + incrementoPorShock;
    let saldoRemanente = fondos - gastoFinalConCrisis;
    let ratioAbsorcionTotal = (gastoFinalConCrisis / fondos) * 100;

    let condicionEst = "Solvente (Fondos sufientes con holgura)"; let claseEst = "risk-estat-est";
    if(saldoRemanente < 0) { condicionEst = "Insolvencia Crítica (Estás en deuda/déficit)"; claseEst = "risk-estat-cri"; }
    else if(ratioAbsorcionTotal > 85) { condicionEst = "Riesgo Técnico (Dinero muy justo)"; claseEst = "risk-estat-pre"; }

    document.getElementById('pres-kpis').innerHTML = `
        <div class="kpi-container">
            <div class="kpi-card"><span>Tu Dinero Inicial</span><h5>${fondos.toLocaleString()} Bs</h5></div>
            <div class="kpi-card"><span>Gasto + Inflación</span><h5>${gastoFinalConCrisis.toFixed(0)} Bs</h5></div>
            <div class="kpi-card"><span>Saldo de Salida</span><h5>${saldoRemanente.toFixed(0)} Bs</h5></div>
            <div class="kpi-card"><span>Presión Económica</span><h5>${ratioAbsorcionTotal.toFixed(0)}%</h5></div>
        </div>
        <p class="texto-por-que"><strong>¿Por qué sale esto?:</strong> Con un <b>${shock}% de inflación</b> el gasto sube a <b>${gastoFinalConCrisis.toFixed(0)} Bs</b>, dejando tu saldo libre en <b>${saldoRemanente.toFixed(0)} Bs</b> y consumiendo el <b>${ratioAbsorcionTotal.toFixed(0)}%</b> de tus ahorros.</p>
        <div class="risk-tag ${claseEst}">Diagnóstico Financiero: Tu estado es [${condicionEst}]</div>
    `;

    let pctSeguridadBarra = Math.min(Math.max((gastoFinalConCrisis / fondos) * 100, 0), 100);
    document.getElementById('pres-barra-seguridad').innerHTML = `
        <p style="font-size:0.75rem; margin-bottom:4px; color:#94a3b8;">Saturación Presupuestaria (Espacio ocupado por tus deudas y gastos):</p>
        <div class="progress-track"><div class="progress-fill-bar" style="width: ${pctSeguridadBarra}%; background:#ef4444;"></div></div>
    `;

    document.getElementById('pres-conclusion').innerHTML = `
        <div class="ai-conclusion">
            <strong>Conclusión Automática de Auditoría:</strong> El dinero libre tras aplicar el <strong>${shock}%</strong> de inflación es de <strong>${saldoRemanente.toFixed(0)} Bs</strong>. Tu presupuesto experimenta una tasa de absorción del <strong>${ratioAbsorcionTotal.toFixed(0)}%</strong>. Un porcentaje mayor al 85% significa que cualquier imprevisto de salud o transporte romperá tu estabilidad.
        </div>
    `;

    document.getElementById('pres-explicacion-grafico').innerHTML = `
        <p class="texto-por-que"><strong>¿Qué mide la dona circular?:</strong> Divide visualmente tus fondos; si la tajada rosa (Gasto) absorbe casi todo el círculo, avisa que te estás quedando sin dinero para emergencias.</p>
    `;

    let filasP = "";
    let shocksEjemplo = [5, 15, 30, 50];
    shocksEjemplo.forEach(sEk => {
        let gSimulado = gastoBase * (1 + (sEk / 100));
        let remSimulado = fondos - gSimulado;
        let porcentajeOcupado = (gSimulado / fondos) * 100;
        filasP += `<tr><td>Si la inflación sube a +${sEk}%</td><td>${gSimulado.toFixed(0)} Bs</td><td>${porcentajeOcupado.toFixed(0)}%</td><td>${remSimulado >= 0 ? '✔️ Saldo Suficiente' : '❌ Te Quedas en Deuda'}</td></tr>`;
    });

    document.getElementById('pres-tabla-contenedor').innerHTML = `
        <h4 class="sub-table-title">📊 Lista de Estrés: Proyección de Fondos frente a Diferentes Niveles de Inflación</h4>
        <p class="texto-por-que"><strong>¿De qué trata?:</strong> Evalúa la resistencia de tu dinero frente a escenarios de inflación futuros para calcular cuándo caerías en pérdidas.</p>
        <table class="sub-table"><thead><tr><th>Porcentaje de Inflación Evaluado</th><th>Precio Final de la Compra</th><th>Capacidad de Absorción (%)</th><th>Estado de Solvencia</th></tr></thead><tbody>${filasP}</tbody></table>
    `;

    document.getElementById('pres-desglose-panel').classList.remove('hidden-element');

    setTimeout(() => {
        let ctx = document.getElementById('chartPres').getContext('2d');
        if(InstanciaGraficoPresupuesto) InstanciaGraficoPresupuesto.destroy();
        
        let porcionRemanente = saldoRemanente > 0 ? saldoRemanente : 0;
        let porcionDeficit = saldoRemanente < 0 ? Math.abs(saldoRemanente) : 0;

        InstanciaGraficoPresupuesto = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Gasto Consumido', 'Dinero de Reserva Libre', 'Déficit/Deuda Extra'],
                datasets: [{
                    data: [gastoFinalConCrisis, porcionRemanente, porcionDeficit],
                    backgroundColor: ['#ec4899', '#10b981', '#ef4444']
                }]
            },
            options: { responsive: true }
        });
    }, 40);
}