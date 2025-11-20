const API_BASE_URL = 'http://localhost:8080/api';
const appContent = document.getElementById('app-content');
const navLinks = document.querySelectorAll('.sidebar a');

// Variáveis globais para dados auxiliares
let categoriasAux = [];
let locaisAux = [];
const GENEROS = ['MASCULINO', 'FEMININO', 'OUTRO', 'NAO_INFORMADO'];
const STATUS_INSCRICAO = ['PENDENTE', 'CONFIRMADO', 'CANCELADO'];

// --- 1. ROTEAMENTO E INICIALIZAÇÃO ---

function loadRoute(route) {
    // Garante que o link correto esteja ativo na barra lateral
    navLinks.forEach(link => link.classList.remove('active'));
    const activeLink = document.querySelector(`[data-route="${route}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Remove qualquer formulário modal ou container de edição persistente
    const formContainer = document.getElementById('form-container');
    if (formContainer) formContainer.innerHTML = '';

    switch (route) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'categorias':
            loadCategoriasManager();
            break;
        case 'locais':
            loadLocaisManager();
            break;
        case 'participantes':
            loadParticipantesManager();
            break;
        case 'eventos':
            loadEventosManager();
            break;
        case 'inscricoes':
            loadIngressosAdminManager();
            break;
        default:
            appContent.innerHTML = `<h1>Página ${route.toUpperCase()} não encontrada!</h1>`;
    }
}

navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const route = e.target.getAttribute('data-route');
        loadRoute(route);
    });
});

document.addEventListener('DOMContentLoaded', () => {
    loadRoute('dashboard');
});

// --- 2. DASHBOARD ---

async function loadDashboard() {
    appContent.innerHTML = `
        <h1>🏠 Dashboard de Eventos</h1>
        <p>Visão geral rápida do sistema.</p>
        <div id="dashboard-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
            <p>Carregando estatísticas...</p>
        </div>
    `;

    try {
        const [eventos, participantes, inscricoes] = await Promise.all([
            fetch(`${API_BASE_URL}/eventos`).then(res => res.json()),
            fetch(`${API_BASE_URL}/participantes`).then(res => res.json()),
            fetch(`${API_BASE_URL}/inscricoes`).then(res => res.json())
        ]);

        const statsContainer = document.getElementById('dashboard-stats');
        statsContainer.innerHTML = `
            ${renderStatCard('🗓️ Eventos Totais', eventos.length, '#007bff')}
            ${renderStatCard('👤 Participantes Registrados', participantes.length, '#28a745')}
            ${renderStatCard('🎟️ Inscrições Totais', inscricoes.length, '#ffc107')}
        `;

    } catch (error) {
        document.getElementById('dashboard-stats').innerHTML =
            `<p style="color: red;">Não foi possível carregar as estatísticas. Verifique se o backend está ativo: ${error.message}</p>`;
    }
}

function renderStatCard(title, count, color) {
    return `
        <div style="background-color: white; padding: 20px; border-radius: 8px; border-left: 5px solid ${color}; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <h3 style="color: ${color}; margin-top: 0;">${title}</h3>
            <p style="font-size: 2.5em; font-weight: bold; margin: 0;">${count}</p>
        </div>
    `;
}

// --- 3. GERENCIAMENTO DE CATEGORIAS (CRUD) ---

async function loadCategoriasManager() {
    appContent.innerHTML = `
        <h1>🏷️ Gerenciamento de Categorias</h1>
        <button class="btn btn-primary" onclick="openCategoriaModal()">+ Nova Categoria</button>
        <div id="categorias-list">Carregando categorias...</div>
        <div id="form-container"></div>
        `;
    fetchCategorias();
}

async function fetchCategorias() {
    try {
        const response = await fetch(`${API_BASE_URL}/categorias`);
        if (!response.ok) throw new Error('Falha ao carregar categorias.');
        const categorias = await response.json();
        renderCategoriasTable(categorias);
    } catch (error) {
        document.getElementById('categorias-list').innerHTML = `<p style="color: red;">Erro ao conectar com a API: ${error.message}</p>`;
    }
}

function renderCategoriasTable(categorias) {
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${categorias.map(cat => `
                    <tr>
                        <td>${cat.id}</td>
                        <td>${cat.nome}</td>
                        <td>
                            <button class="btn btn-warning" onclick="editCategoria(${cat.id}, '${cat.nome}')">Editar</button>
                            <button class="btn btn-danger" onclick="deleteCategoria(${cat.id})">Excluir</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('categorias-list').innerHTML = tableHTML;
}

function editCategoria(id, nome) {
    openCategoriaModal(id, nome);
}

function openCategoriaModal(id = null, nome = '') {
    const isEdit = id !== null;
    const formHTML = `
        <h2>${isEdit ? 'Editar Categoria: ' + nome : 'Criar Nova Categoria'}</h2>
        <form id="categoria-form" onsubmit="handleCategoriaSubmit(event)">
            <input type="hidden" id="categoria-id" value="${id || ''}">
            <label for="categoria-nome">Nome:</label>
            <input type="text" id="categoria-nome" value="${nome}" required><br><br>
            <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Categoria' : 'Criar Categoria'}</button>
            <button type="button" class="btn btn-danger" onclick="document.getElementById('form-container').innerHTML = ''">Cancelar</button>
        </form>
    `;

    let formContainer = document.getElementById('form-container');
    if (!formContainer) { // Cria o container se ele não existir
        formContainer = document.createElement('div');
        formContainer.id = 'form-container';
        formContainer.style.marginBottom = '20px';
        appContent.insertBefore(formContainer, document.getElementById('categorias-list'));
    }
    formContainer.innerHTML = formHTML;
}


async function handleCategoriaSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('categoria-id').value;
    const nome = document.getElementById('categoria-nome').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/categorias/${id}` : `${API_BASE_URL}/categorias`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome: nome })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        document.getElementById('form-container').innerHTML = '';
        alert(`Categoria salva com sucesso!`);
        fetchCategorias();
    } catch (error) {
        alert(`Erro ao salvar categoria: ${error.message}`);
        console.error('Erro de API:', error);
    }
}

async function deleteCategoria(id) {
    if (!confirm(`Tem certeza que deseja excluir a categoria ID ${id}? Esta ação é irreversível.`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/categorias/${id}`, { method: 'DELETE' });

        if (response.status === 204) {
            alert('Categoria excluída com sucesso!');
            fetchCategorias();
        } else if (response.status === 404) {
            alert('Erro: Categoria não encontrada.');
        } else {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
    } catch (error) {
        alert(`Erro ao excluir categoria: ${error.message}`);
        console.error('Erro de API:', error);
    }
}

// --- 4. GERENCIAMENTO DE LOCAIS (CRUD) ---

async function loadLocaisManager() {
    appContent.innerHTML = `
        <h1>📍 Gerenciamento de Locais</h1>
        <button class="btn btn-primary" onclick="openLocalModal()">+ Novo Local</button>
        <div id="locais-list">Carregando locais...</div>
        <div id="form-container"></div>
        `;
    fetchLocais();
}

async function fetchLocais() {
    try {
        const response = await fetch(`${API_BASE_URL}/locais`);
        if (!response.ok) throw new Error('Falha ao carregar locais.');
        const locais = await response.json();
        renderLocaisTable(locais);
    } catch (error) {
        document.getElementById('locais-list').innerHTML = `<p style="color: red;">Erro ao carregar locais: ${error.message}</p>`;
    }
}

function renderLocaisTable(locais) {
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Endereço</th>
                    <th>Capacidade</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${locais.map(local => `
                    <tr>
                        <td>${local.id}</td>
                        <td>${local.nome}</td>
                        <td>${local.endereco}</td>
                        <td>${local.capacidade}</td>
                        <td>
                            <button class="btn btn-warning" onclick="editLocal(${local.id}, '${local.nome}', '${local.endereco}', ${local.capacidade})">Editar</button>
                            <button class="btn btn-danger" onclick="deleteLocal(${local.id})">Excluir</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('locais-list').innerHTML = tableHTML;
}


function openLocalModal(id = null, nome = '', endereco = '', capacidade = '') {
    const isEdit = id !== null;
    const formHTML = `
        <h2>${isEdit ? 'Editar Local' : 'Criar Novo Local'}</h2>
        <form id="local-form" onsubmit="handleLocalSubmit(event)">
            <input type="hidden" id="local-id" value="${id || ''}">

            <label for="local-nome">Nome:</label>
            <input type="text" id="local-nome" value="${nome}" required><br><br>

            <label for="local-endereco">Endereço:</label>
            <input type="text" id="local-endereco" value="${endereco}" required><br><br>

            <label for="local-capacidade">Capacidade:</label>
            <input type="number" id="local-capacidade" value="${capacidade}" required><br><br>

            <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Alterações' : 'Criar Local'}</button>
            <button type="button" class="btn btn-danger" onclick="document.getElementById('form-container').innerHTML = ''">Cancelar</button>
        </form>
    `;

    let formContainer = document.getElementById('form-container');
    if (!formContainer) {
        formContainer = document.createElement('div');
        formContainer.id = 'form-container';
        formContainer.style.marginBottom = '20px';
        appContent.insertBefore(formContainer, document.getElementById('locais-list'));
    }
    formContainer.innerHTML = formHTML;
}

function editLocal(id, nome, endereco, capacidade) {
    openLocalModal(id, nome, endereco, capacidade);
}

async function handleLocalSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('local-id').value;
    const nome = document.getElementById('local-nome').value;
    const endereco = document.getElementById('local-endereco').value;
    const capacidade = parseInt(document.getElementById('local-capacidade').value, 10);

    const data = { nome, endereco, capacidade };
    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/locais/${id}` : `${API_BASE_URL}/locais`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Erro HTTP: ${response.status}`);
        }

        document.getElementById('form-container').innerHTML = '';
        alert(`Local ${id ? 'atualizado' : 'criado'} com sucesso!`);
        fetchLocais();
    } catch (error) {
        alert(`Erro ao salvar local: ${error.message}`);
        console.error('Erro de API:', error);
    }
}

async function deleteLocal(id) {
    if (!confirm(`Tem certeza que deseja excluir o Local ID ${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/locais/${id}`, { method: 'DELETE' });

        if (response.status === 204) {
            alert('Local excluído com sucesso!');
            fetchLocais();
        } else if (response.status === 404) {
            alert('Erro: Local não encontrado.');
        } else {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
    } catch (error) {
        alert(`Erro ao excluir local: ${error.message}`);
        console.error('Erro de API:', error);
    }
}

// --- 5. GERENCIAMENTO DE EVENTOS (CRUD E INSCRIÇÃO) ---

async function loadEventosManager() {
    appContent.innerHTML = `
        <h1>🗓️ Gerenciamento de Eventos</h1>
        <button class="btn btn-primary" onclick="openEventoModal()">+ Novo Evento</button>
        <div id="eventos-list">Carregando dados...</div>
        <div id="form-container"></div>
    `;
    await fetchAuxiliaryData();
    fetchEventos();
}

// Busca Locais e Categorias auxiliares
async function fetchAuxiliaryData() {
    try {
        const [categoriasResponse, locaisResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/categorias`),
            fetch(`${API_BASE_URL}/locais`)
        ]);

        if (!categoriasResponse.ok || !locaisResponse.ok) {
             throw new Error('Falha ao carregar dados auxiliares (Categorias/Locais).');
        }

        categoriasAux = await categoriasResponse.json();
        locaisAux = await locaisResponse.json();

    } catch (error) {
        alert(`Erro ao carregar dados auxiliares: ${error.message}`);
        console.error('Erro de API:', error);
    }
}

async function fetchEventos() {
    try {
        const response = await fetch(`${API_BASE_URL}/eventos`);
        if (!response.ok) throw new Error('Falha ao carregar eventos.');
        const eventos = await response.json();
        renderEventosTable(eventos);
    } catch (error) {
        document.getElementById('eventos-list').innerHTML = `<p style="color: red;">Erro ao carregar eventos: ${error.message}</p>`;
    }
}

function renderEventosTable(eventos) {
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Data/Hora</th>
                    <th>Categoria</th>
                    <th>Local</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${eventos.map(evento => `
                    <tr>
                        <td>${evento.id}</td>
                        <td>${evento.nome}</td>
                        <td>${new Date(evento.dataHora).toLocaleString('pt-BR')}</td>
                        <td>${evento.categoria.nome}</td>
                        <td>${evento.local.nome}</td>
                        <td>
                            <button class="btn btn-success btn-sm" onclick="openInscricaoModal(${evento.id}, '${evento.nome}')">Inscrever</button>
                            <button class="btn btn-warning btn-sm" onclick="editEvento(${evento.id})">Editar</button>
                            <button class="btn btn-danger btn-sm" onclick="deleteEvento(${evento.id})">Excluir</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('eventos-list').innerHTML = tableHTML;
}

// Função de Edição (chama o modal com o ID)
function editEvento(id) {
    openEventoModal(id);
}

async function openEventoModal(eventoId = null) {
    if (categoriasAux.length === 0 || locaisAux.length === 0) {
        await fetchAuxiliaryData();
    }

    let evento = {};
    const isEdit = eventoId !== null;

    if (isEdit) {
        try {
            const response = await fetch(`${API_BASE_URL}/eventos/${eventoId}`);
            if (!response.ok) throw new Error('Evento não encontrado.');
            evento = await response.json();
        } catch (error) {
            alert('Erro ao carregar dados do evento para edição.');
            return;
        }
    }

    const modalHTML = `
        <h2>${isEdit ? 'Editar Evento: ' + evento.nome : 'Criar Novo Evento'}</h2>
        <form id="evento-form" onsubmit="handleEventoSubmit(event)">
            <input type="hidden" id="evento-id" value="${eventoId || ''}">

            <label for="evento-nome">Nome:</label>
            <input type="text" id="evento-nome" value="${evento.nome || ''}" required><br><br>

            <label for="evento-descricao">Descrição:</label>
            <textarea id="evento-descricao" required>${evento.descricao || ''}</textarea><br><br>

            <label for="evento-dataHora">Data e Hora:</label>
            <input type="datetime-local" id="evento-dataHora" value="${evento.dataHora ? evento.dataHora.substring(0, 16) : ''}" required><br><br>

            <label for="evento-categoria">Categoria:</label>
            <select id="evento-categoria" required>
                <option value="">Selecione uma categoria</option>
                ${categoriasAux.map(cat => `
                    <option value="${cat.id}" ${evento.categoria && evento.categoria.id === cat.id ? 'selected' : ''}>
                        ${cat.nome}
                    </option>
                `).join('')}
            </select><br><br>

            <label for="evento-local">Local:</label>
            <select id="evento-local" required>
                <option value="">Selecione um local</option>
                ${locaisAux.map(local => `
                    <option value="${local.id}" ${evento.local && evento.local.id === local.id ? 'selected' : ''}>
                        ${local.nome} (${local.endereco})
                    </option>
                `).join('')}
            </select><br><br>

            <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Evento' : 'Criar Evento'}</button>
            <button type="button" class="btn btn-danger" onclick="document.getElementById('form-container').innerHTML = ''">Cancelar</button>
        </form>
    `;

    let formContainer = document.getElementById('form-container');
    if (!formContainer) {
        formContainer = document.createElement('div');
        formContainer.id = 'form-container';
        formContainer.style.marginBottom = '20px';
        appContent.insertBefore(formContainer, document.getElementById('eventos-list'));
    }
    formContainer.innerHTML = modalHTML;
}

// Função de submissão do formulário
async function handleEventoSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('evento-id').value;
    const nome = document.getElementById('evento-nome').value;
    const descricao = document.getElementById('evento-descricao').value;
    const dataHora = document.getElementById('evento-dataHora').value;
    const categoriaId = document.getElementById('evento-categoria').value;
    const localId = document.getElementById('evento-local').value;

    const data = {
        nome,
        descricao,
        dataHora,
        categoria: { id: parseInt(categoriaId, 10) },
        local: { id: parseInt(localId, 10) }
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/eventos/${id}` : `${API_BASE_URL}/eventos`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || 'Erro ao salvar evento. Verifique os campos.');
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        document.getElementById('form-container').innerHTML = '';
        alert(`Evento ${id ? 'atualizado' : 'criado'} com sucesso!`);
        fetchEventos();
    } catch (error) {
        alert(`Erro ao salvar evento: ${error.message}`);
        console.error('Erro de API:', error);
    }
}

async function deleteEvento(id) {
    if (!confirm(`Tem certeza que deseja excluir o Evento ID ${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/eventos/${id}`, { method: 'DELETE' });

        if (response.status === 204) {
            alert('Evento excluído com sucesso!');
            fetchEventos();
        } else if (response.status === 404) {
            alert('Erro: Evento não encontrado.');
        } else {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
    } catch (error) {
        alert(`Erro ao excluir evento: ${error.message}`);
        console.error('Erro de API:', error);
    }
}

// --- 6. GERENCIAMENTO DE PARTICIPANTES (CRUD) ---

async function loadParticipantesManager() {
    appContent.innerHTML = `
        <h1>👥 Gerenciamento de Participantes</h1>
        <button class="btn btn-primary" onclick="openParticipanteModal()">+ Novo Participante</button>
        <div id="participantes-list">Carregando participantes...</div>
        <div id="form-container"></div>
    `;
    fetchParticipantes();
}

async function fetchParticipantes() {
    try {
        const response = await fetch(`${API_BASE_URL}/participantes`);
        if (!response.ok) throw new Error('Falha ao carregar participantes.');
        const participantes = await response.json();
        renderParticipantesTable(participantes);
    } catch (error) {
        // CORREÇÃO: Usar 'participantes-list' para a mensagem de erro
        document.getElementById('participantes-list').innerHTML = `<p style="color: red;">Erro ao carregar participantes: ${error.message}</p>`;
    }
}

function renderParticipantesTable(participantes) {
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nome</th>
                    <th>Email</th>
                    <th>CPF</th>
                    <th>Telefone</th>
                    <th>Gênero</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${participantes.map(p => `
                    <tr>
                        <td>${p.id}</td>
                        <td>${p.nome}</td>
                        <td>${p.email}</td>
                        <td>${p.cpf}</td>
                        <td>${p.telefone}</td>
                        <td>${p.genero}</td>
                        <td>
                            <button class="btn btn-warning" onclick="editParticipante(${p.id})">Editar</button>
                            <button class="btn btn-danger" onclick="deleteParticipante(${p.id})">Excluir</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('participantes-list').innerHTML = tableHTML;
}

// Função de Edição (chama o modal com o ID)
function editParticipante(id) {
    openParticipanteModal(id);
}

async function openParticipanteModal(participanteId = null) {
    let p = {};
    const isEdit = participanteId !== null;

    if (isEdit) {
        try {
            const response = await fetch(`${API_BASE_URL}/participantes/${participanteId}`);
            if (!response.ok) throw new Error('Participante não encontrado.');
            p = await response.json();
        } catch (error) {
            alert('Erro ao carregar dados do participante para edição.');
            return;
        }
    }

    const dataNascimentoFormatada = p.dataNascimento ? p.dataNascimento.substring(0, 10) : '';

    const formHTML = `
        <h2>${isEdit ? 'Editar Participante' : 'Criar Novo Participante'}</h2>
        <form id="participante-form" onsubmit="handleParticipanteSubmit(event)">
            <input type="hidden" id="participante-id" value="${participanteId || ''}">

            <label for="p-nome">Nome:</label>
            <input type="text" id="p-nome" value="${p.nome || ''}" required><br><br>

            <label for="p-email">Email:</label>
            <input type="email" id="p-email" value="${p.email || ''}" required><br><br>

            <label for="p-cpf">CPF (11 dígitos):</label>
            <input type="text" id="p-cpf" value="${p.cpf || ''}" pattern="\\d{11}" maxlength="11" required><br><br>

            <label for="p-telefone">Telefone:</label>
            <input type="text" id="p-telefone" value="${p.telefone || ''}"><br><br>

            <label for="p-dataNascimento">Data de Nascimento:</label>
            <input type="date" id="p-dataNascimento" value="${dataNascimentoFormatada || ''}"><br><br>

            <label for="p-genero">Gênero:</label>
            <select id="p-genero">
                ${GENEROS.map(g => `
                    <option value="${g}" ${p.genero === g ? 'selected' : ''}>
                        ${g.replace('_', ' ')}
                    </option>
                `).join('')}
            </select><br><br>

            <button type="submit" class="btn btn-primary">${isEdit ? 'Salvar Participante' : 'Criar Participante'}</button>
            <button type="button" class="btn btn-danger" onclick="document.getElementById('form-container').innerHTML = ''">Cancelar</button>
        </form>
    `;

    let formContainer = document.getElementById('form-container');
    if (!formContainer) {
        formContainer = document.createElement('div');
        formContainer.id = 'form-container';
        formContainer.style.marginBottom = '20px';
        appContent.insertBefore(formContainer, document.getElementById('participantes-list'));
    }
    formContainer.innerHTML = formHTML;
}

async function handleParticipanteSubmit(event) {
    event.preventDefault();

    const id = document.getElementById('participante-id').value;
    const nome = document.getElementById('p-nome').value;
    const email = document.getElementById('p-email').value;
    const cpf = document.getElementById('p-cpf').value;
    const telefone = document.getElementById('p-telefone').value;
    const dataNascimento = document.getElementById('p-dataNascimento').value;
    const genero = document.getElementById('p-genero').value;

    const data = {
        nome,
        email,
        cpf,
        telefone,
        dataNascimento,
        genero
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_BASE_URL}/participantes/${id}` : `${API_BASE_URL}/participantes`;

    try {
        const response = await fetch(url, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || 'Erro ao salvar participante. Verifique os campos (CPF e Email únicos).');
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        document.getElementById('form-container').innerHTML = '';
        alert(`Participante ${id ? 'atualizado' : 'criado'} com sucesso!`);
        fetchParticipantes();
    } catch (error) {
        alert(`Erro ao salvar participante: ${error.message}`);
        console.error('Erro de API:', error);
    }
}

async function deleteParticipante(id) {
    if (!confirm(`Tem certeza que deseja excluir o Participante ID ${id}?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/participantes/${id}`, { method: 'DELETE' });

        if (response.status === 204) {
            alert('Participante excluído com sucesso!');
            fetchParticipantes();
        } else if (response.status === 404) {
            alert('Erro: Participante não encontrado.');
        } else {
            throw new Error(`Erro HTTP: ${response.status}`);
        }
    } catch (error) {
        alert(`Erro ao excluir participante: ${error.message}`);
        console.error('Erro de API:', error);
    }
}

// --- 7. ADICIONAR PESSOAS NOS EVENTOS (CRIAÇÃO DE INSCRIÇÃO) ---

async function openInscricaoModal(eventoId, eventoNome) {
    let participantes = [];
    try {
        const response = await fetch(`${API_BASE_URL}/participantes`);
        participantes = await response.json();
    } catch (error) {
        alert('Não foi possível carregar a lista de participantes.');
        return;
    }

    const modalHTML = `
        <h2>Inscrever Participante em: ${eventoNome}</h2>
        <form id="inscricao-form" onsubmit="handleInscricaoSubmit(event)">
            <input type="hidden" id="inscricao-evento-id" value="${eventoId}">

            <label for="inscricao-participante">Participante:</label>
            <select id="inscricao-participante" required>
                <option value="">Selecione um Participante</option>
                ${participantes.map(p => `<option value="${p.id}">${p.nome} (CPF: ${p.cpf})</option>`).join('')}
            </select><br><br>

            <button type="submit" class="btn btn-success">Confirmar Inscrição</button>
            <button type="button" class="btn btn-danger" onclick="document.getElementById('form-container').innerHTML = ''">Cancelar</button>
        </form>
    `;

    let formContainer = document.getElementById('form-container');
    if (!formContainer) {
        formContainer = document.createElement('div');
        formContainer.id = 'form-container';
        formContainer.style.marginBottom = '20px';
        appContent.insertBefore(formContainer, document.getElementById('eventos-list'));
    }
    formContainer.innerHTML = modalHTML;
}

async function handleInscricaoSubmit(event) {
    event.preventDefault();

    const eventoId = document.getElementById('inscricao-evento-id').value;
    const participanteId = document.getElementById('inscricao-participante').value;

    const data = {
        // O backend espera o ID do evento e do participante para criar a inscrição
        evento: { id: parseInt(eventoId, 10) },
        participante: { id: parseInt(participanteId, 10) }
    };

    try {
        const response = await fetch(`${API_BASE_URL}/inscricoes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.message || 'Erro ao criar inscrição. O participante pode já estar inscrito neste evento.');
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        document.getElementById('form-container').innerHTML = '';
        alert('Inscrição criada com sucesso! Verifique em Ingressos (Admin).');
    } catch (error) {
        alert(`Erro ao criar inscrição: ${error.message}`);
        console.error('Erro de API:', error);
    }
}

// --- 8. MONITORAMENTO DE INGRESSOS (ADMIN) ---

async function loadIngressosAdminManager() {
    appContent.innerHTML = `
        <h1>🎟️ Monitoramento de Ingressos (Admin)</h1>
        <p>Visão detalhada de todas as inscrições, participantes e status.</p>
        <div id="ingressos-list">Carregando ingressos...</div>
        <div id="form-container"></div>
    `;
    fetchIngressosAdmin();
}

async function fetchIngressosAdmin() {
    try {
        // Endpoint que retorna o DTO detalhado do backend
        const response = await fetch(`${API_BASE_URL}/inscricoes/admin`);
        if (!response.ok) throw new Error('Falha ao carregar ingressos do Admin.');
        const ingressos = await response.json();
        renderIngressosAdminTable(ingressos);
    } catch (error) {
        document.getElementById('ingressos-list').innerHTML = `<p style="color: red;">Erro ao carregar ingressos: ${error.message}</p>`;
    }
}

function renderIngressosAdminTable(ingressos) {
    const tableHTML = `
        <table>
            <thead>
                <tr>
                    <th>Código Ingresso</th>
                    <th>Evento</th>
                    <th>Participante</th>
                    <th>CPF</th>
                    <th>Status</th>
                    <th>Data Inscrição</th>
                    <th>Ações</th>
                </tr>
            </thead>
            <tbody>
                ${ingressos.map(i => `
                    <tr>
                        <td style="font-weight: bold;">${i.codigoIngresso}</td>
                        <td>${i.nomeEvento}</td>
                        <td>${i.nomeParticipante} (${i.emailParticipante})</td>
                        <td>${i.cpfParticipante}</td>
                        <td>${renderStatusSelect(i.inscricaoId, i.status)}</td>
                        <td>${new Date(i.dataInscricao).toLocaleDateString('pt-BR')}</td>
                        <td>
                            <button class="btn btn-primary btn-sm" onclick="changeInscricaoStatus(${i.inscricaoId})">Salvar Status</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
    document.getElementById('ingressos-list').innerHTML = tableHTML;
}

// Função auxiliar que cria o dropdown de status
function renderStatusSelect(id, currentStatus) {
    const options = STATUS_INSCRICAO.map(status => `
        <option value="${status}" ${status === currentStatus ? 'selected' : ''}>
            ${status.replace('_', ' ')}
        </option>
    `).join('');

    return `<select id="status-select-${id}">${options}</select>`;
}

async function changeInscricaoStatus(inscricaoId) {
    const newStatus = document.getElementById(`status-select-${inscricaoId}`).value;

    if (!confirm(`Confirmar mudança de status para ${newStatus} no ingresso ${inscricaoId}?`)) {
        return;
    }

    try {
        const url = `${API_BASE_URL}/inscricoes/${inscricaoId}/status?status=${newStatus}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' }
        });

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`);
        }

        alert(`Status do ingresso ${inscricaoId} atualizado para ${newStatus} com sucesso!`);
        fetchIngressosAdmin();
    } catch (error) {
        alert(`Erro ao atualizar status: ${error.message}`);
        console.error('Erro de API:', error);
    }
}