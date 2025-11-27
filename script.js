const displayRelogio = document.getElementById('relogio');
const displayProx = document.getElementById('proxSinal');
const btnIniciar = document.getElementById('btnIniciar');
const statusTexto = document.getElementById('status');
const audio = document.getElementById('somPadrao');

// Configuração dos Horários (Formato HH:MM)
const horarios = [
    "07:50", // Fim da 1ª aula
    "08:40", // Fim da 2ª aula
    "09:30", // Recreio
    "09:50", // Volta do Recreio
    "10:40"  // Fim da 3ª aula
];

let sistemaAtivo = false;
let wakeLock = null;

// Função para manter a tela ligada (Essencial para mobile)
async function manterTelaLigada() {
    try {
        wakeLock = await navigator.wakeLock.request('screen');
        statusTexto.innerText = "Sistema Ativo e Tela Bloqueada (Não feche)";
        statusTexto.style.color = "green";
    } catch (err) {
        console.log(`${err.name}, ${err.message}`);
        statusTexto.innerText = "Sistema Ativo (Mantenha o app aberto)";
    }
}

btnIniciar.addEventListener('click', () => {
    sistemaAtivo = true;
    audio.play(); // Toca brevemente e pausa para liberar a permissão do navegador
    audio.pause();
    audio.currentTime = 0;
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
        if (horarios.includes(horaAtual)) {
            tocarSinal();
        }
        atualizarProximoSinal();
    }
}

function tocarSinal() {
    // Aqui você pode colocar lógica para tocar sons diferentes dependendo da hora
    audio.play();
    console.log("Tocando sinal!");
}

function atualizarProximoSinal() {
    const agora = new Date();
    const horaAtualMinutos = agora.getHours() * 60 + agora.getMinutes();
    
    // Encontra o próximo horário
    const proximo = horarios.find(h => {
        const [hh, mm] = h.split(':');
        return (parseInt(hh) * 60 + parseInt(mm)) > horaAtualMinutos;
    });

    displayProx.innerText = proximo || "Amanhã";
}

setInterval(atualizarRelogio, 1000);
