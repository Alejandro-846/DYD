// import { DndApiService } from '../api/dndApi.js';
// import { populateSelect, generateStats } from '../js/utils.js';

// export class CharacterGenerator {
//   constructor() {
//       this.characters = [];
//       this.savedCharacters = JSON.parse(localStorage.getItem('savedCharacters')) || [];
//       this.init();
//   }

//   async init() {
//       await this.loadAllData();
//       this.setupEventListeners();
//       this.renderSavedCharacters();
//   }

//   async loadAllData() {
//       try {
//           const { races, classes, alignments, equipment, skills, feats } = await DndApiService.loadAllData();
          
//           populateSelect('race', races.results);
//           populateSelect('class', classes.results);
//           populateSelect('alignment', alignments.results);
//           populateSelect('filter-race', races.results);
//           populateSelect('filter-class', classes.results);
          
//           const armorCategory = equipment.results.find(cat => cat.index === 'armor');
//           const weaponCategory = equipment.results.find(cat => cat.index === 'weapon');
          
//           if (armorCategory) {
//               const armorItems = await DndApiService.fetchAPI(`equipment-categories/${armorCategory.index}`);
//               populateSelect('armor', armorItems.equipment);
//           }
          
//           if (weaponCategory) {
//               const weaponItems = await DndApiService.fetchAPI(`equipment-categories/${weaponCategory.index}`);
//               populateSelect('weapon', weaponItems.equipment);
//           }
          
//           populateSelect('skill', skills.results);
//           populateSelect('feat', feats.results);

//       } catch (error) {
//           console.error('Error loading data:', error);
//           alert('Error al cargar datos de la API. Por favor recarga la página.');
//       }
//   }

//   setupEventListeners() {
//       document.getElementById('character-form').addEventListener('submit', (e) => {
//           e.preventDefault();
//           this.generateCharacter();
//       });

//       document.getElementById('clear-form').addEventListener('click', () => {
//           this.clearForm();
//       });

//       document.getElementById('search-button').addEventListener('click', () => {
//           this.filterCharacters();
//       });

//       document.getElementById('search-name').addEventListener('keypress', (e) => {
//           if (e.key === 'Enter') this.filterCharacters();
//       });

//       document.getElementById('filter-race').addEventListener('change', () => {
//           this.filterCharacters();
//       });
//       document.getElementById('filter-class').addEventListener('change', () => {
//           this.filterCharacters();
//       });
//       document.getElementById('filter-gender').addEventListener('change', () => {
//           this.filterCharacters();
//       });

//       document.getElementById('reset-filters').addEventListener('click', () => {
//           this.resetFilters();
//       });

//       document.getElementById('theme-toggle').addEventListener('click', () => {
//           document.body.dataset.theme = document.body.dataset.theme === 'dark' ? 'light' : 'dark';
//           document.getElementById('theme-toggle').innerHTML = document.body.dataset.theme === 'dark' 
//               ? '<i class="fas fa-moon"></i>' 
//               : '<i class="fas fa-sun"></i>';
//       });

//       document.querySelector('.burger').addEventListener('click', () => {
//           document.querySelector('.nav-links').classList.toggle('active');
//           document.querySelector('.burger').classList.toggle('toggle');
//       });

//       document.querySelectorAll('a[href^="#"]').forEach(anchor => {
//           anchor.addEventListener('click', function(e) {
//               e.preventDefault();
//               document.querySelector(this.getAttribute('href')).scrollIntoView({
//                   behavior: 'smooth'
//               });
//               document.querySelector('.nav-links').classList.remove('active');
//               document.querySelector('.burger').classList.remove('toggle');
//           });
//       });

//       document.querySelector('.close-modal').addEventListener('click', () => {
//           document.getElementById('character-modal').style.display = 'none';
//       });

//       window.addEventListener('click', (e) => {
//           if (e.target === document.getElementById('character-modal')) {
//               document.getElementById('character-modal').style.display = 'none';
//           }
//       });
//   }

//   clearForm() {
//       document.getElementById('character-form').reset();
//       document.getElementById('preview-placeholder').style.display = 'flex';
//       document.getElementById('character-card').style.display = 'none';
//   }

//   resetFilters() {
//       document.getElementById('search-name').value = '';
//       document.getElementById('filter-race').value = '';
//       document.getElementById('filter-class').value = '';
//       document.getElementById('filter-gender').value = '';
//       this.filterCharacters();
//   }

//   async generateCharacter() {
//       const formData = {
//           name: document.getElementById('name').value,
//           race: document.getElementById('race').value,
//           class: document.getElementById('class').value,
//           gender: document.getElementById('gender').value,
//           alignment: document.getElementById('alignment').value,
//           armor: document.getElementById('armor').value,
//           weapon: document.getElementById('weapon').value,
//           skill: document.getElementById('skill').value,
//           feat: document.getElementById('feat').value
//       };
      
//       if (!formData.name || !formData.race || !formData.class) {
//           alert('Por favor completa los campos obligatorios');
//           return;
//       }

//       try {
//           const [raceData, classData] = await Promise.all([
//               DndApiService.fetchAPI(`races/${formData.race}`),
//               DndApiService.fetchAPI(`classes/${formData.class}`)
//           ]);

//           const equipmentPromises = [];
//           if (formData.armor) equipmentPromises.push(DndApiService.fetchEquipmentDetails('equipment', formData.armor));
//           if (formData.weapon) equipmentPromises.push(DndApiService.fetchEquipmentDetails('equipment', formData.weapon));
          
//           const abilityPromises = [];
//           if (formData.skill) abilityPromises.push(DndApiService.fetchAbilityDetails('skills', formData.skill));
//           if (formData.feat) abilityPromises.push(DndApiService.fetchAbilityDetails('feats', formData.feat));
          
//           const [equipmentData, abilityData] = await Promise.all([
//               Promise.all(equipmentPromises),
//               Promise.all(abilityPromises)
//           ]);

//           const character = {
//               id: Date.now().toString(),
//               name: formData.name,
//               race: raceData.name,
//               raceIndex: formData.race,
//               class: classData.name,
//               classIndex: formData.class,
//               gender: formData.gender || 'No especificado',
//               alignment: formData.alignment || 'No especificado',
//               hitPoints: Math.floor(Math.random() * 10) + classData.hit_die,
//               stats: generateStats(),
//               equipment: equipmentData.map(item => ({
//                   name: item.name,
//                   type: item.equipment_category?.name || 'Equipo',
//                   description: item.desc?.join(' ') || 'Sin descripción disponible',
//                   index: item.index
//               })),
//               abilities: abilityData.map(ability => ({
//                   name: ability.name,
//                   type: ability.type || 'Habilidad',
//                   description: ability.desc?.join(' ') || 'Sin descripción disponible',
//                   index: ability.index
//               })),
//               features: classData.features?.map(f => f.name) || [],
//               createdAt: new Date().toISOString()
//           };

//           this.displayCharacter(character);
//           this.characters.push(character);

//       } catch (error) {
//           console.error('Error generating character:', error);
//           alert('Error al generar el personaje. Por favor intenta nuevamente.');
//       }
//   }

//   displayCharacter(character) {
//       const placeholder = document.getElementById('preview-placeholder');
//       const card = document.getElementById('character-card');
      
//       placeholder.style.display = 'none';
//       card.style.display = 'block';
      
//       card.innerHTML = `
//           <div class="character-header">
//               <h3>${character.name}</h3>
//               <p class="character-subtitle">${character.race} ${character.class}</p>
//               <p class="character-meta">
//                   <span>${character.gender}</span>
//                   <span>${character.alignment}</span>
//               </p>
//           </div>
//           <div class="character-image">
//               <i class="fas fa-user-astronaut"></i>
//           </div>
//           <div class="character-stats">
//               <p><strong>Puntos de vida:</strong> ${character.hitPoints}</p>
//               <div class="stats-grid">
//                   ${character.stats.map(stat => `
//                       <div class="stat-item">
//                           <span class="stat-value">${stat.value}</span>
//                           <span class="stat-name">${stat.short}</span>
//                       </div>
//                   `).join('')}
//               </div>
//           </div>
//           <div class="character-actions">
//               <button class="save-character">
//                   <i class="fas fa-save"></i> GUARDAR
//               </button>
//               <button class="view-full">
//                   <i class="fas fa-eye"></i> VER DETALLES
//               </button>
//           </div>
//       `;
      
//       card.querySelector('.save-character').addEventListener('click', () => {
//           this.saveCharacter(character);
//       });
      
//       card.querySelector('.view-full').addEventListener('click', () => {
//           this.showCharacterDetails(character);
//       });
//   }

//   saveCharacter(character) {
//       const exists = this.savedCharacters.some(c => c.id === character.id);
      
//       if (!exists) {
//           this.savedCharacters.push(character);
//           localStorage.setItem('savedCharacters', JSON.stringify(this.savedCharacters));
//           this.renderSavedCharacters();
//           this.clearForm();
//           alert(`${character.name} ha sido guardado correctamente!`);
//       } else {
//           alert('Este personaje ya está guardado.');
//       }
//   }

//   filterCharacters() {
//       const filters = {
//           name: document.getElementById('search-name').value.toLowerCase(),
//           race: document.getElementById('filter-race').value,
//           class: document.getElementById('filter-class').value,
//           gender: document.getElementById('filter-gender').value
//       };

//       const filtered = this.savedCharacters.filter(character => {
//           return (!filters.name || character.name.toLowerCase().includes(filters.name)) &&
//                  (!filters.race || character.raceIndex === filters.race) &&
//                  (!filters.class || character.classIndex === filters.class) &&
//                  (!filters.gender || character.gender.toLowerCase() === filters.gender);
//       });

//       this.renderCharactersList(filtered);
//   }

//   renderSavedCharacters() {
//       this.renderCharactersList(this.savedCharacters);
//   }

//   renderCharactersList(characters) {
//       const container = document.getElementById('characters-container');
      
//       if (characters.length === 0) {
//           container.innerHTML = `
//               <div class="empty-state">
//                   <i class="fas fa-users-slash"></i>
//                   <p>No se encontraron personajes</p>
//               </div>
//           `;
//           return;
//       }

//       container.innerHTML = characters.map(character => `
//           <div class="character-item" data-id="${character.id}">
//               <h3>${character.name}</h3>
//               <p>${character.race} ${character.class}</p>
//               <div class="character-meta">
//                   <span>${character.gender}</span>
//                   <span>${character.alignment}</span>
//               </div>
//               <a href="#" class="view-details" data-id="${character.id}">
//                   <i class="fas fa-eye"></i> Ver detalles
//               </a>
//           </div>
//       `).join('');

//       document.querySelectorAll('.view-details').forEach(button => {
//           button.addEventListener('click', (e) => {
//               e.preventDefault();
//               const character = this.savedCharacters.find(c => c.id === button.getAttribute('data-id'));
//               if (character) this.showCharacterDetails(character);
//           });
//       });
//   }

//   showCharacterDetails(character) {
//       const modalContent = document.getElementById('modal-character-content');
      
//       modalContent.innerHTML = `
//           <div class="character-details">
//               <div class="details-header">
//                   <h2>${character.name}</h2>
//                   <p class="subtitle">${character.race} ${character.class}</p>
//                   <div class="meta-info">
//                       <span><strong>Género:</strong> ${character.gender}</span>
//                       <span><strong>Alineamiento:</strong> ${character.alignment}</span>
//                       <span><strong>Puntos de vida:</strong> ${character.hitPoints}</span>
//                   </div>
//               </div>
              
//               <div class="details-grid">
//                   <div class="details-section">
//                       <h3><i class="fas fa-chart-bar"></i> Estadísticas</h3>
//                       <div class="stats-grid">
//                           ${character.stats.map(stat => `
//                               <div class="stat-item">
//                                   <span class="stat-value">${stat.value}</span>
//                                   <span class="stat-name">${stat.name}</span>
//                                   <span class="stat-modifier">${stat.modifier >= 0 ? '+' : ''}${stat.modifier}</span>
//                               </div>
//                           `).join('')}
//                       </div>
//                   </div>
                  
//                   <div class="details-section">
//                       <h3><i class="fas fa-shield-alt"></i> Equipo</h3>
//                       ${character.equipment.length > 0 ? `
//                           <ul class="equipment-list">
//                               ${character.equipment.map(item => `
//                                   <li>
//                                       <strong>${item.name}</strong> 
//                                       <span class="item-type">${item.type}</span>
//                                       ${item.description ? `<p class="item-description">${item.description}</p>` : ''}
//                                   </li>
//                               `).join('')}
//                           </ul>
//                       ` : '<p>No tiene equipo</p>'}
//                   </div>
                  
//                   <div class="details-section">
//                       <h3><i class="fas fa-fire"></i> Habilidades</h3>
//                       ${character.abilities.length > 0 ? `
//                           <ul class="abilities-list">
//                               ${character.abilities.map(ability => `
//                                   <li>
//                                       <strong>${ability.name}</strong> 
//                                       <span class="ability-type">${ability.type}</span>
//                                       ${ability.description ? `<p class="ability-description">${ability.description}</p>` : ''}
//                                   </li>
//                               `).join('')}
//                           </ul>
//                       ` : '<p>No tiene habilidades especiales</p>'}
//                   </div>
                  
//                   <div class="details-section">
//                       <h3><i class="fas fa-star"></i> Rasgos</h3>
//                       ${character.features.length > 0 ? `
//                           <ul class="features-list">
//                               ${character.features.map(feature => `
//                                   <li>${feature}</li>
//                               `).join('')}
//                           </ul>
//                       ` : '<p>No tiene rasgos especiales</p>'}
//                   </div>
//               </div>
              
//               <div class="details-footer">
//                   <small>Creado el: ${new Date(character.createdAt).toLocaleDateString()}</small>
//               </div>
//           </div>
//       `;
      
//       document.getElementById('character-modal').style.display = 'block';
//   }
// }
