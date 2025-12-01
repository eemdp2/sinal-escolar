const displayRelogio = document.getElementById('relogio');
const displayProx = document.getElementById('proxSinal');
const btnIniciar = document.getElementById('btnIniciar');
const statusTexto = document.getElementById('status');

// Mapeamento simples: Horário -> ID do Áudio
// Nota: O horário 17:10 é tratado de forma especial na função tocarSinal
const mapaHorarios = {
    // --- MANHÃ ---
    "07:00": "somA1", // Início
    "07:45": "somA2", // Fim 1ª
    "08:30": "somA3", // Fim 2ª
    "09:15": "somA4", // Início Intervalo
    "09:36": "somA5", // Aviso (4 min antes de 09:40)
    "09:40": "somA6", // Fim Intervalo / Início 4ª
    "10:25": "somA7", // Início 5ª
    "11:10": "somA8", // Início 6ª
    "11:55": "somA9", // Fim 6ª (Saída Manhã)

    // --- TARDE ---
    "13:00": "somA1", // Início
    "13:45": "somA2", // Fim 1ª
    "14:30": "somA3", // Fim 2ª
    "15:15": "somA4", // Início Intervalo
    "15:36": "somA5", // Aviso (4 min antes de 15:40)
    "15:40": "somA6", // Fim Intervalo / Início 4ª
    "16:25": "somA7", // Início 5ª
    "17:55": "somA9"  // Fim 6ª (Apenas Seg/Ter)
};

// Horários especiais que exigem lógica extra
const horariosEspeciais = ["17:10"]; 

let sistemaAtivo = false;
let wakeLock = null;

// Mantém a tela ligada
async function manterTelaLigada() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        statusTexto.innerText = "Sistema Ativo e Tela Bloqueada (Não feche)";
        statusTexto.style.color = "#4CAF50"; // Verde
    } catch (err) {
        statusTexto.innerText = "Sistema Ativo (Mantenha o app aberto)";
    }
}

btnIniciar.addEventListener('click', () => {
    sistemaAtivo = true;
    // Toca um som mudo ou breve apenas para liberar o áudio no navegador
    const unlock = document.getElementById('somA1');
    unlock.play().catch(() => {});
    unlock.pause();
    
    btnIniciar.style.display = 'none';
    manterTelaLigada();
    atualizarProximoSinal();
});

function atualizarRelogio() {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0');
    const minutos = String(agora.getMinutes()).padStart(2, '0');
    const segundos = String(agora.getSeconds()).padStart(2, '0');
    const horaAtual = `${horas}:${minutos}`;

    displayRelogio.innerText = `${horas}:${minutos}:${segundos}`;

    if (sistemaAtivo && segundos === "00") {
        verificarToque(horaAtual);
    }
    // Atualiza o próximo sinal a cada virada de minuto para economizar processamento
    if (segundos === "00") {
        atualizarProximoSinal();
    }
}

function verificarToque(hora) {
    // Caso 1: Horário Especial (17:10 - Saída vs 6ª Aula)
    if (hora === "17:10") {
        const diaSemana = new Date().getDay(); // 0=Dom, 1=Seg, 2=Ter, 3=Qua, 4=Qui, 5=Sex
        
        // Se for Quarta(3), Quinta(4) ou Sexta(5)
        if (diaSemana >= 3 && diaSemana <= 5) {
            tocarAudio('somFim'); // Encerra aulas
            console.log("Sexta aula cancelada (Qua-Sex). Tocando saída.");
        } else {
            tocarAudio('somA8'); // Começa a 6ª aula (Seg/Ter)
            console.log("Iniciando 6ª aula.");
        }
        return;
    }

    // Caso 2: Horários normais da lista
    if (mapaHorarios[hora]) {
        tocarAudio(mapaHorarios[hora]);
    }
}

function tocarAudio(idElemento) {
    const audio = document.getElementById(idElemento);
    if (audio) {
        audio.currentTime = 0;
        audio.play();
        console.log(`Tocando: ${idElemento}`);
    }
}

function atualizarProximoSinal() {
    const agora = new Date();
    const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes();
    
    // Junta todas as chaves de horário para procurar o próximo
    const listaHorarios = [...Object.keys(mapaHorarios), ...horariosEspeciais];
    
    // Ordena os horários
    listaHorarios.sort();

    const proximo = listaHorarios.find(h => {
        const [hh, mm] = h.split(':');
        return (parseInt(hh) * 60 + parseInt(mm)) > horaAtualMinutos;
    });

    displayProx.innerText = proximo || "Amanhã";
}

setInterval(atualizarRelogio, 1000);
