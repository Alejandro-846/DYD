// app.js
document.addEventListener('DOMContentLoaded', () => {
    // Ocultar loader y mostrar contenido
    setTimeout(() => {
        document.querySelector('.loading').style.display = 'none';
        document.getElementById('app-content').style.display = 'block';

        // Inicializar la aplicación
        initApp();
    }, 1500);
});

function initApp() {
    // Configuración de Partículas.js
    particlesJS('particles-js', {
        particles: {
            number: { value: 80, density: { enable: true, value_area: 800 } },
            color: { value: "#6a5acd" },
            shape: { type: "circle" },
            opacity: { value: 0.5, random: true },
            size: { value: 3, random: true },
            line_linked: { enable: true, distance: 150, color: "#6a5acd", opacity: 0.4, width: 1 },
            move: { enable: true, speed: 2, direction: "none", random: true, straight: false }
        },
        interactivity: {
            events: {
                onhover: { enable: true, mode: "repulse" }
            }
        }
    });

    // Clase principal para manejar la aplicación
    class CharacterGenerator {
        constructor() {
            this.characters = [];
            this.savedCharacters = JSON.parse(localStorage.getItem('savedCharacters')) || [];
            this.init();
        }

        async init() {
            await this.loadAllData();
            this.setupEventListeners();
            this.renderSavedCharacters();
            
            // Cargar tema guardado
            const savedTheme = localStorage.getItem('theme') || 'dark';
            document.body.dataset.theme = savedTheme;
            document.getElementById('theme-toggle').innerHTML = savedTheme === 'dark' 
                ? '<i class="fas fa-moon"></i>' 
                : '<i class="fas fa-sun"></i>';
        }

        async loadAllData() {
            try {
                const [races, classes, equipment, skills, feats] = await Promise.all([
                    this.fetchAPI('races'),
                    this.fetchAPI('classes'),
                    this.fetchAPI('equipment-categories'),
                    this.fetchAPI('skills'),
                    this.fetchAPI('feats')
                ]);

                // Rellenar formulario de creación
                this.populateSelect('race', races.results);
                this.populateSelect('class', classes.results);
                
                // Alineamientos fijos (no hay endpoint en la API)
                const alignments = [
                    { index: 'lg', name: 'Legal Bueno' },
                    { index: 'ng', name: 'Neutral Bueno' },
                    { index: 'cg', name: 'Caótico Bueno' },
                    { index: 'ln', name: 'Legal Neutral' },
                    { index: 'tn', name: 'Verdadero Neutral' },
                    { index: 'cn', name: 'Caótico Neutral' },
                    { index: 'le', name: 'Legal Malvado' },
                    { index: 'ne', name: 'Neutral Malvado' },
                    { index: 'ce', name: 'Caótico Malvado' }
                ];
                this.populateSelect('alignment', alignments);
                
                // Rellenar filtros de búsqueda
                this.populateSelect('filter-race', races.results);
                this.populateSelect('filter-class', classes.results);
                
                // Cargar equipamiento (armaduras y armas)
                const armorCategory = equipment.results.find(cat => cat.index === 'armor');
                const weaponCategory = equipment.results.find(cat => cat.index === 'weapon');
                
                if (armorCategory) {
                    try {
                        const armorItems = await this.fetchAPI(`equipment-categories/${armorCategory.index}`);
                        this.populateSelect('armor', armorItems.equipment);
                    } catch (error) {
                        console.error('Error loading armor:', error);
                        this.populateSelect('armor', []);
                    }
                }
                
                if (weaponCategory) {
                    try {
                        const weaponItems = await this.fetchAPI(`equipment-categories/${weaponCategory.index}`);
                        this.populateSelect('weapon', weaponItems.equipment);
                    } catch (error) {
                        console.error('Error loading weapons:', error);
                        this.populateSelect('weapon', []);
                    }
                }
                
                this.populateSelect('skill', skills.results);
                this.populateSelect('feat', feats.results);

            } catch (error) {
                console.error('Error loading data:', error);
                alert('Error al cargar datos de la API. Por favor recarga la página.');
            }
        }

        async fetchAPI(endpoint) {
            try {
                const response = await fetch(`https://www.dnd5eapi.co/api/${endpoint}`);
                if (!response.ok) {
                    throw new Error(`Error ${response.status}: ${response.statusText}`);
                }
                return await response.json();
            } catch (error) {
                console.error(`Error fetching ${endpoint}:`, error);
                throw error;
            }
        }

        populateSelect(elementId, items) {
            const select = document.getElementById(elementId);
            // Limpiar solo las opciones adicionales, no la primera opción por defecto
            while (select.options.length > 1) {
                select.remove(1);
            }
            
            items.forEach(item => {
                const option = document.createElement('option');
                option.value = item.index || item.name.toLowerCase().replace(/\s+/g, '-');
                option.textContent = item.name;
                select.appendChild(option);
            });
        }

        setupEventListeners() {
            // Generar personaje
            document.getElementById('character-form').addEventListener('submit', (e) => {
                e.preventDefault();
                this.generateCharacter();
            });

            // Limpiar formulario
            document.getElementById('clear-form').addEventListener('click', () => {
                this.clearForm();
            });

            // Buscar personajes
            document.getElementById('search-button').addEventListener('click', () => {
                this.filterCharacters();
            });

            // Buscar al presionar Enter en el campo de búsqueda
            document.getElementById('search-name').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.filterCharacters();
                }
            });

            // Filtrar al cambiar los selectores
            document.getElementById('filter-race').addEventListener('change', () => {
                this.filterCharacters();
            });
            document.getElementById('filter-class').addEventListener('change', () => {
                this.filterCharacters();
            });
            document.getElementById('filter-gender').addEventListener('change', () => {
                this.filterCharacters();
            });

            // Limpiar filtros
            document.getElementById('reset-filters').addEventListener('click', () => {
                this.resetFilters();
            });

            // Toggle del tema oscuro/claro
            document.getElementById('theme-toggle').addEventListener('click', () => {
                const currentTheme = document.body.dataset.theme;
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                document.body.dataset.theme = newTheme;
                document.getElementById('theme-toggle').innerHTML = newTheme === 'dark' 
                    ? '<i class="fas fa-moon"></i>' 
                    : '<i class="fas fa-sun"></i>';
                localStorage.setItem('theme', newTheme);
            });

            // Menú hamburguesa (responsive)
            document.querySelector('.burger').addEventListener('click', () => {
                document.querySelector('.nav-links').classList.toggle('active');
                document.querySelector('.burger').classList.toggle('toggle');
            });

            // Scroll suave
            document.querySelectorAll('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    e.preventDefault();
                    document.querySelector(this.getAttribute('href')).scrollIntoView({
                        behavior: 'smooth'
                    });
                    document.querySelector('.nav-links').classList.remove('active');
                    document.querySelector('.burger').classList.remove('toggle');
                });
            });

            // Modal
            document.querySelector('.close-modal').addEventListener('click', () => {
                document.getElementById('character-modal').style.display = 'none';
            });

            // Cerrar modal al hacer clic fuera
            window.addEventListener('click', (e) => {
                if (e.target === document.getElementById('character-modal')) {
                    document.getElementById('character-modal').style.display = 'none';
                }
            });
        }

        clearForm() {
            document.getElementById('character-form').reset();
            document.getElementById('preview-placeholder').style.display = 'flex';
            document.getElementById('character-card').style.display = 'none';
        }

        resetFilters() {
            document.getElementById('search-name').value = '';
            document.getElementById('filter-race').value = '';
            document.getElementById('filter-class').value = '';
            document.getElementById('filter-gender').value = '';
            this.filterCharacters();
        }

        async generateCharacter() {
            const name = document.getElementById('name').value;
            const race = document.getElementById('race').value;
            const cls = document.getElementById('class').value;
            const gender = document.getElementById('gender').value;
            const alignment = document.getElementById('alignment').value;
            const armor = document.getElementById('armor').value;
            const weapon = document.getElementById('weapon').value;
            const skill = document.getElementById('skill').value;
            const feat = document.getElementById('feat').value;
            
            if (!name || !race || !cls) {
                alert('Por favor completa los campos obligatorios: Nombre, Raza y Clase');
                return;
            }

            try {
                // Mostrar loader mientras se genera
                const generateBtn = document.querySelector('.generate-btn');
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generando...';
                generateBtn.disabled = true;

                // Obtener datos básicos del personaje
                const [raceData, classData] = await Promise.all([
                    this.fetchAPI(`races/${race}`),
                    this.fetchAPI(`classes/${cls}`)
                ]);

                // Función para cargar equipo con manejo de errores
                const loadEquipment = async (type, value) => {
                    if (!value) return null;
                    try {
                        return await this.fetchAPI(`equipment/${value}`);
                    } catch (error) {
                        console.warn(`Error cargando ${type}:`, error);
                        return {
                            name: document.getElementById(type).options[document.getElementById(type).selectedIndex].text,
                            equipment_category: { name: type === 'armor' ? 'Armadura' : 'Arma' },
                            desc: ['Descripción no disponible'],
                            index: value
                        };
                    }
                };

                // Función para cargar habilidades con manejo de errores
                const loadAbility = async (type, value) => {
                    if (!value) return null;
                    try {
                        return await this.fetchAPI(`${type}s/${value}`);
                    } catch (error) {
                        console.warn(`Error cargando ${type}:`, error);
                        return {
                            name: document.getElementById(type).options[document.getElementById(type).selectedIndex].text,
                            type: type === 'skill' ? 'Habilidad' : 'Dote',
                            desc: ['Descripción no disponible'],
                            index: value
                        };
                    }
                };

                // Obtener equipo y habilidades
                const [armorData, weaponData, skillData, featData] = await Promise.all([
                    loadEquipment('armor', armor),
                    loadEquipment('weapon', weapon),
                    loadAbility('skill', skill),
                    loadAbility('feat', feat)
                ]);

                // Filtrar resultados nulos
                const equipmentData = [armorData, weaponData].filter(item => item !== null);
                const abilityData = [skillData, featData].filter(item => item !== null);

                // Crear el personaje
                const character = {
                    id: Date.now().toString(),
                    name,
                    race: raceData.name,
                    raceIndex: race,
                    class: classData.name,
                    classIndex: cls,
                    gender: gender || 'No especificado',
                    alignment: alignment || 'No especificado',
                    hitPoints: Math.floor(Math.random() * 10) + classData.hit_die,
                    stats: this.generateStats(),
                    equipment: equipmentData.map(item => ({
                        name: item.name,
                        type: item.equipment_category?.name || 'Equipo',
                        description: item.desc?.join(' ') || 'Sin descripción disponible',
                        index: item.index
                    })),
                    abilities: abilityData.map(ability => ({
                        name: ability.name,
                        type: ability.type || 'Habilidad',
                        description: ability.desc?.join(' ') || 'Sin descripción disponible',
                        index: ability.index
                    })),
                    features: classData.features?.map(f => f.name) || [],
                    createdAt: new Date().toISOString()
                };

                this.displayCharacter(character);
                this.characters.push(character);

            } catch (error) {
                console.error('Error generando personaje:', error);
                alert(`Error al generar el personaje: ${error.message || 'Error desconocido'}`);
            } finally {
                // Restaurar el botón
                const generateBtn = document.querySelector('.generate-btn');
                generateBtn.innerHTML = '<i class="fas fa-magic"></i> GENERAR PERSONAJE';
                generateBtn.disabled = false;
            }
        }

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

        filterCharacters() {
            const nameFilter = document.getElementById('search-name').value.toLowerCase();
            const raceFilter = document.getElementById('filter-race').value;
            const classFilter = document.getElementById('filter-class').value;
            const genderFilter = document.getElementById('filter-gender').value;

            const filtered = this.savedCharacters.filter(character => {
                const nameMatch = !nameFilter || 
                    character.name.toLowerCase().includes(nameFilter);
                
                const raceMatch = !raceFilter || 
                    character.raceIndex === raceFilter;
                
                const classMatch = !classFilter || 
                    character.classIndex === classFilter;
                
                const genderMatch = !genderFilter || 
                    character.gender.toLowerCase() === genderFilter;
                
                return nameMatch && raceMatch && classMatch && genderMatch;
            });

            this.renderCharactersList(filtered);
        }

        renderSavedCharacters() {
            this.renderCharactersList(this.savedCharacters);
        }

        renderCharactersList(characters) {
            const container = document.getElementById('characters-container');
            
            if (characters.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-users-slash"></i>
                        <p>No se encontraron personajes</p>
                    </div>
                `;
                return;
            }

            container.innerHTML = characters.map(character => `
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
                                            <strong>${item.name}</strong> 
                                            <span class="item-type">${item.type}</span>
                                            ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : '<p>No tiene equipo</p>'}
                        </div>
                        
                        <div class="details-section">
                            <h3><i class="fas fa-fire"></i> Habilidades</h3>
                            ${character.abilities.length > 0 ? `
                                <ul class="abilities-list">
                                    ${character.abilities.map(ability => `
                                        <li>
                                            <strong>${ability.name}</strong> 
                                            <span class="ability-type">${ability.type}</span>
                                            ${ability.description ? `<p class="ability-description">${ability.description}</p>` : ''}
                                        </li>
                                    `).join('')}
                                </ul>
                            ` : '<p>No tiene habilidades especiales</p>'}
                        </div>
                        
                        <div class="details-section">
                            <h3><i class="fas fa-star"></i> Rasgos</h3>
                            ${character.features.length > 0 ? `
                                <ul class="features-list">
                                    ${character.features.map(feature => `
                                        <li>${feature}</li>
                                    `).join('')}
                                </ul>
                            ` : '<p>No tiene rasgos especiales</p>'}
                        </div>
                    </div>
                    
                    <div class="details-footer">
                        <small>Creado el: ${new Date(character.createdAt).toLocaleDateString()}</small>
                    </div>
                </div>
            `;
            
            document.getElementById('character-modal').style.display = 'block';
        }
    }

    // Efecto de texto rotativo
    class TextRotator {
        constructor(element) {
            this.element = element;
            this.words = JSON.parse(element.getAttribute('data-rotate'));
            this.currentWordIndex = 0;
            this.interval = null;
            this.start();
        }

        start() {
            this.rotateText();
            this.interval = setInterval(() => this.rotateText(), 2000);
        }

        rotateText() {
            this.element.style.opacity = '0';
            
            setTimeout(() => {
                this.currentWordIndex = (this.currentWordIndex + 1) % this.words.length;
                this.element.textContent = this.words[this.currentWordIndex];
                this.element.style.opacity = '1';
            }, 500);
        }
    }

    // Inicializar la aplicación
    new CharacterGenerator();

    // Inicializar efecto de texto rotativo
    const textRotateElements = document.querySelectorAll('.text-rotate');
    textRotateElements.forEach(el => new TextRotator(el));
}