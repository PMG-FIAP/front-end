console.log(utils)
// Classe principal para gerenciar o mapa e os pontos de alagamento
class MapaAlagamentos {
    constructor() {
        this.map = null;
        this.markers = [];
        this.circles = [];
        this.alagamentos = utils.storage.get('alagamentos') || [];
        this.init();
    }

    // Inicializa o mapa
    init() {
        // Coordenadas iniciais (São Paulo)
        const saoPaulo = { lat: -23.550520, lng: -46.633308 };
        
        this.map = new google.maps.Map(document.getElementById('mapa'), {
            zoom: 12,
            center: saoPaulo,
            mapTypeId: 'roadmap'
        });

        // Adiciona os pontos salvos
        this.carregarAlagamentos();

        // Adiciona listener para clique no mapa
        this.map.addListener('click', (event) => {
            this.adicionarAlagamento(event.latLng);
        });
    }

    // Adiciona um novo ponto de alagamento
    adicionarAlagamento(latLng) {
        const alagamento = {
            id: Date.now(),
            lat: latLng.lat(),
            lng: latLng.lng(),
            data: new Date().toISOString()
        };

        this.alagamentos.push(alagamento);
        this.atualizarStorage();
        this.atualizarMapa();
    }

    // Atualiza o localStorage
    atualizarStorage() {
        utils.storage.set('alagamentos', this.alagamentos);
    }

    // Carrega os alagamentos salvos
    carregarAlagamentos() {
        // Limpa marcadores antigos
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];
        this.alagamentos.forEach(alagamento => {
            this.criarMarcador(alagamento);
        });
        this.atualizarCirculos();
    }

    // Cria um marcador no mapa
    criarMarcador(alagamento) {
        const marker = new google.maps.Marker({
            position: { lat: alagamento.lat, lng: alagamento.lng },
            map: this.map,
            title: `Alagamento reportado em ${utils.date.formatDateTime(alagamento.data)}`
        });

        // Permite remover o pin ao clicar
        marker.addListener('click', () => {
            if (confirm('Deseja remover este ponto de alagamento?')) {
                this.removerAlagamento(alagamento.id);
            }
        });

        this.markers.push(marker);
    }

    // Remove um alagamento pelo id
    removerAlagamento(id) {
        this.alagamentos = this.alagamentos.filter(a => a.id !== id);
        this.atualizarStorage();
        this.atualizarMapa();
    }

    // Atualiza os círculos baseado na densidade de alagamentos
    atualizarCirculos() {
        // Remove círculos existentes
        this.circles.forEach(circle => circle.setMap(null));
        this.circles = [];

        // Agrupa alagamentos próximos
        const grupos = this.agruparAlagamentos();

        grupos.forEach(grupo => {
            let color, fillColor;
            if (grupo.length >= 4) {
                color = fillColor = '#F44336'; // vermelho
            } else {
                color = fillColor = '#FFC107'; // amarelo
            }
            const circle = new google.maps.Circle({
                strokeColor: color,
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: fillColor,
                fillOpacity: 0.35,
                map: this.map,
                center: utils.geo.calculateCenter(grupo),
                radius: 500,
                clickable: false
            });
            this.circles.push(circle);
        });
    }

    // Agrupa alagamentos próximos
    agruparAlagamentos() {
        const grupos = [];
        const visitados = new Set();

        this.alagamentos.forEach(alagamento => {
            if (visitados.has(alagamento.id)) return;

            const grupo = [alagamento];
            visitados.add(alagamento.id);

            this.alagamentos.forEach(outro => {
                if (visitados.has(outro.id)) return;

                const distancia = utils.geo.calculateDistance(
                    alagamento.lat, alagamento.lng,
                    outro.lat, outro.lng
                );

                if (distancia < 0.3) { // 300 metros
                    grupo.push(outro);
                    visitados.add(outro.id);
                }
            });

            grupos.push(grupo);
        });

        return grupos;
    }

    // Atualiza o mapa com novos dados
    atualizarMapa() {
        // Remove marcadores existentes
        this.markers.forEach(marker => marker.setMap(null));
        this.markers = [];

        // Recria marcadores e círculos
        this.carregarAlagamentos();
    }
}

// Inicializa o mapa quando a API do Google Maps estiver carregada
window.initMap = () => {
    window.mapaAlagamentos = new MapaAlagamentos();
}; 