// app.js
import { eventBus } from './eventBus.js';
import { initializeMap } from './map.js';

// Inicializa o Mapa Base da Esri
initializeMap();

// Simulação de injeção de dados da IA após 4 segundos
setTimeout(() => {
  const payloadIA = {
    id_evento: "RT-884",
    agente: "Agente de Triangulação",
    sintese: "Inconsistência Logística: Rota declarada diverge do transponder marítimo (AIS). Possível transbordo em alto mar para evasão antidumping."
  };
  
  eventBus.publish('NOVO_ALERTA_IA', payloadIA);
}, 4000);

// Escuta eventos e atualiza a UI
eventBus.subscribe('NOVO_ALERTA_IA', (payload) => {
  // 1. Atualiza KPI
  const kpiAlerts = document.getElementById('kpi-alerts');
  const kpiRisk = document.getElementById('kpi-risk');
  kpiAlerts.innerText = parseInt(kpiAlerts.innerText) + 1;
  kpiRisk.innerText = "88/100";
  kpiRisk.style.color = "#f59e0b"; // Fica Laranja

  // 2. Injeta Card no Feed Lateral
  const feed = document.getElementById('event-feed');
  const card = document.createElement('div');
  card.className = 'event-card glass-panel';
  card.style.borderLeftColor = "#ef4444"; // Vermelho crítico
  
  card.innerHTML = `
    <div class="event-header">
      <span class="agent-name">🛰️ ${payload.agente}</span>
      <span class="time">Agora</span>
    </div>
    <p>${payload.sintese}</p>
  `;
  
  // Animação de entrada
  card.style.opacity = 0;
  feed.prepend(card);
  
  setTimeout(() => {
    card.style.transition = "opacity 0.5s ease";
    card.style.opacity = 1;
  }, 100);
});
