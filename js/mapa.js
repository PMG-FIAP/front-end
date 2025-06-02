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
            title: `Alagamento reportado em ${new Date(alagamento.data).toLocaleString()}`
        });

        this.markers.push(marker);
    }

    // Atualiza os círculos baseado na densidade de alagamentos
    atualizarCirculos() {
        // Remove círculos existentes
        this.circles.forEach(circle => circle.setMap(null));
        this.circles = [];

        // Agrupa alagamentos próximos
        const grupos = this.agruparAlagamentos();

        // Cria círculos para cada grupo
        grupos.forEach(grupo => {
            const circle = new google.maps.Circle({
                strokeColor: grupo.length > 3 ? '#F44336' : '#FFC107',
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: grupo.length > 3 ? '#F44336' : '#FFC107',
                fillOpacity: 0.35,
                map: this.map,
                center: this.calcularCentro(grupo),
                radius: 300 // 300 metros
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

                const distancia = this.calcularDistancia(
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

    // Calcula a distância entre dois pontos em quilômetros
    calcularDistancia(lat1, lon1, lat2, lon2) {
        const R = 6371; // Raio da Terra em km
        const dLat = this.toRad(lat2 - lat1);
        const dLon = this.toRad(lon2 - lon1);
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                 Math.cos(this.toRad(lat1)) * Math.cos(this.toRad(lat2)) * 
                 Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    // Converte graus para radianos
    toRad(valor) {
        return valor * Math.PI / 180;
    }

    // Calcula o centro de um grupo de pontos
    calcularCentro(grupo) {
        const lat = grupo.reduce((sum, p) => sum + p.lat, 0) / grupo.length;
        const lng = grupo.reduce((sum, p) => sum + p.lng, 0) / grupo.length;
        return { lat, lng };
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