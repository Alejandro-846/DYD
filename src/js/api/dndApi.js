export class DndApiService {
    static async fetchAPI(endpoint) {
        const response = await fetch(`https://www.dnd5eapi.co/api/${endpoint}`);
        if (!response.ok) throw new Error('Error en la petición a la API');
        return await response.json();
    }
  
    static async loadAllData() {
        try {
            const [races, classes, alignments, equipment, skills, feats] = await Promise.all([
                this.fetchAPI('races'),
                this.fetchAPI('classes'),
                this.fetchAPI('alignments'),
                this.fetchAPI('equipment-categories'),
                this.fetchAPI('skills'),
                this.fetchAPI('feats')
            ]);
            return { races, classes, alignments, equipment, skills, feats };
        } catch (error) {
            console.error('Error loading API data:', error);
            throw error;
        }
    }
  
    static async fetchEquipmentDetails(type, index) {
        return this.fetchAPI(`equipment/${index}`);
    }
  
    static async fetchAbilityDetails(type, index) {
        return this.fetchAPI(`${type}/${index}`);
    }
  }