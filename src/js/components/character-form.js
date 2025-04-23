import { loadDnDData, loadEquipmentDetails, loadClassDetails } from '../api/dndApi.js';

export class CharacterGenerator {
    constructor() {
        this.characters = [];
        this.savedCharacters = JSON.parse(localStorage.getItem('savedCharacters')) || [];
        this.init();
    }

    async init() {
        await this.loadAllData();
        this.setupFormEventListeners();
        this.renderSavedCharacters();
    }

    async loadAllData() {
        try {
            const { races, classes, alignments, equipment } = await loadDnDData();
            
            this.populateSelect('race', races.results);
            this.populateSelect('class', classes.results);
            this.populateSelect('alignment', alignments.results);
            
            // Cargar equipamiento
            const armorCategory = equipment.results.find(cat => cat.index === 'armor');
            const weaponCategory = equipment.results.find(cat => cat.index === 'weapon');
            
            if (armorCategory) {
                const armorItems = await fetchAPI(`equipment-categories/${armorCategory.index}`);
                this.populateSelect('armor', armorItems.equipment);
            }
            
            if (weaponCategory) {
                const weaponItems = await fetchAPI(`equipment-categories/${weaponCategory.index}`);
                this.populateSelect('weapon', weaponItems.equipment);
            }

        } catch (error) {
            console.error('Error loading data:', error);
            alert('Error al cargar datos de la API. Por favor recarga la página.');
        }
    }

    populateSelect(elementId, items) {
        const select = document.getElementById(elementId);
        items.forEach(item => {
            const option = document.createElement('option');
            option.value = item.index;
            option.textContent = item.name;
            select.appendChild(option);
        });
    }

    setupFormEventListeners() {
        // Generar personaje
        document.getElementById('character-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.generateCharacter();
        });

        // Limpiar formulario
        document.getElementById('clear-form').addEventListener('click', () => {
            this.clearForm();
        });
    }

    async generateCharacter() {
        const name = document.getElementById('name').value;
        const race = document.getElementById('race').value;
        const cls = document.getElementById('class').value;
        const gender = document.getElementById('gender').value;
        const alignment = document.getElementById('alignment').value;
        const armor = document.getElementById('armor').value;
        const weapon = document.getElementById('weapon').value;
        
        if (!name || !race || !cls) {
            alert('Por favor completa los campos obligatorios');
            return;
        }

        try {
            const [raceData, classData] = await Promise.all([
                fetchAPI(`races/${race}`),
                loadClassDetails(cls)
            ]);

            // Obtener equipo seleccionado
            const equipmentPromises = [];
            if (armor) equipmentPromises.push(loadEquipmentDetails(armor));
            if (weapon) equipmentPromises.push(loadEquipmentDetails(weapon));
            
            const equipmentData = await Promise.all(equipmentPromises);

            const character = {
                id: Date.now().toString(),
                name,
                race: raceData.name,
                class: classData.name,
                gender: gender || 'No especificado',
                alignment: alignment || 'No especificado',
                hitPoints: Math.floor(Math.random() * 10) + classData.hit_die,
                stats: this.generateStats(),
                equipment: equipmentData.map(item => ({
                    name: item.name,
                    type: item.equipment_category?.name || 'Equipo',
                    description: item.desc?.join(' ') || 'Sin descripción disponible'
                })),
                createdAt: new Date().toISOString()
            };

            this.displayCharacter(character);
            this.characters.push(character);

        } catch (error) {
            console.error('Error generating character:', error);
            alert('Error al generar el personaje. Por favor intenta nuevamente.');
        }
    }

    // Resto de los métodos de la clase CharacterGenerator...
    generateStats() {
        const stats = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
        const statNames = {
            strength: 'Fuerza',
            dexterity: 'Destreza',
            constitution: 'Constitución',
            intelligence: 'Inteligencia',
            wisdom: 'Sabiduría',
            charisma: 'Carisma'
        };
        
        return stats.map(stat => ({
            name: statNames[stat],
            short: stat.substring(0, 3).toUpperCase(),
            value: Math.floor(Math.random() * 10) + 8,
            modifier: Math.floor((Math.floor(Math.random() * 10) + 8 - 10) / 2)
        }));
    }

    displayCharacter(character) {
        const placeholder = document.getElementById('preview-placeholder');
        const card = document.getElementById('character-card');
        
        placeholder.style.display = 'none';
        card.style.display = 'block';
        
        card.innerHTML = `
            <div class="character-header">
                <h3>${character.name}</h3>
                <p class="character-subtitle">${character.race} ${character.class}</p>
                <p class="character-meta">
                    <span>${character.gender}</span>
                    <span>${character.alignment}</span>
                </p>
            </div>
            <div class="character-image">
                <i class="fas fa-user-astronaut"></i>
            </div>
            <div class="character-stats">
                <p><strong>Puntos de vida:</strong> ${character.hitPoints}</p>
                <div class="stats-grid">
                    ${character.stats.map(stat => `
                        <div class="stat-item">
                            <span class="stat-value">${stat.value}</span>
                            <span class="stat-name">${stat.short}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
            <div class="character-actions">
                <button class="save-character">
                    <i class="fas fa-save"></i> GUARDAR
                </button>
                <button class="view-full">
                    <i class="fas fa-eye"></i> VER DETALLES
                </button>
            </div>
        `;
        
        // Event listeners para los botones
        card.querySelector('.save-character').addEventListener('click', () => {
            this.saveCharacter(character);
        });
        
        card.querySelector('.view-full').addEventListener('click', () => {
            this.showCharacterDetails(character);
        });
    }

    saveCharacter(character) {
        // Verificar si el personaje ya existe
        const exists = this.savedCharacters.some(c => c.id === character.id);
        
        if (!exists) {
            this.savedCharacters.push(character);
            localStorage.setItem('savedCharacters', JSON.stringify(this.savedCharacters));
            this.renderSavedCharacters();
            this.clearForm();
            alert(`${character.name} ha sido guardado correctamente!`);
        } else {
            alert('Este personaje ya está guardado.');
        }
    }

    renderSavedCharacters() {
        const container = document.getElementById('characters-container');
        
        if (this.savedCharacters.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-users-slash"></i>
                    <p>No hay personajes guardados</p>
                </div>
            `;
            return;
        }

        container.innerHTML = this.savedCharacters.map(character => `
            <div class="character-item" data-id="${character.id}">
                <h3>${character.name}</h3>
                <p>${character.race} ${character.class}</p>
                <div class="character-meta">
                    <span>${character.gender}</span>
                    <span>${character.alignment}</span>
                </div>
                <a href="#" class="view-details" data-id="${character.id}">
                    <i class="fas fa-eye"></i> Ver detalles
                </a>
            </div>
        `).join('');

        // Agregar event listeners para ver detalles
        document.querySelectorAll('.view-details').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const characterId = button.getAttribute('data-id');
                const character = this.savedCharacters.find(c => c.id === characterId);
                if (character) this.showCharacterDetails(character);
            });
        });
    }

    showCharacterDetails(character) {
        const modalContent = document.getElementById('modal-character-content');
        
        modalContent.innerHTML = `
            <div class="character-details">
                <div class="details-header">
                    <h2>${character.name}</h2>
                    <p class="subtitle">${character.race} ${character.class}</p>
                    <div class="meta-info">
                        <span><strong>Género:</strong> ${character.gender}</span>
                        <span><strong>Alineamiento:</strong> ${character.alignment}</span>
                        <span><strong>Puntos de vida:</strong> ${character.hitPoints}</span>
                    </div>
                </div>
                
                <div class="details-grid">
                    <div class="details-section">
                        <h3><i class="fas fa-chart-bar"></i> Estadísticas</h3>
                        <div class="stats-grid">
                            ${character.stats.map(stat => `
                                <div class="stat-item">
                                    <span class="stat-value">${stat.value}</span>
                                    <span class="stat-name">${stat.name}</span>
                                    <span class="stat-modifier">${stat.modifier >= 0 ? '+' : ''}${stat.modifier}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <div class="details-section">
                        <h3><i class="fas fa-shield-alt"></i> Equipo</h3>
                        ${character.equipment.length > 0 ? `
                            <ul class="equipment-list">
                                ${character.equipment.map(item => `
                                    <li>
                                        <strong>${item.name}</strong> <span class="item-type">(${item.type})</span>
                                        ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                                    </li>
                                `).join('')}
                            </ul>
                        ` : '<p>No tiene equipo</p>'}
                    </div>
                </div>
                
                <div class="details-footer">
                    <small>Creado el: ${new Date(character.createdAt).toLocaleDateString()}</small>
                </div>
            </div>
        `;
        
        document.getElementById('character-modal').style.display = 'block';
    }

    clearForm() {
        document.getElementById('character-form').reset();
        document.getElementById('preview-placeholder').style.display = 'flex';
        document.getElementById('character-card').style.display = 'none';
    }
}