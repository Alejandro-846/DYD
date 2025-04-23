import { fetchAPI } from './api.js';

// Funciones específicas de D&D API
const loadDnDData = async () => {
    const [races, classes, alignments, equipment] = await Promise.all([
        fetchAPI('races'),
        fetchAPI('classes'),
        fetchAPI('alignments'),
        fetchAPI('equipment-categories')
    ]);
    return { races, classes, alignments, equipment };
};

const loadEquipmentDetails = async (equipmentIndex) => {
    return await fetchAPI(`equipment/${equipmentIndex}`);
};

const loadClassDetails = async (classIndex) => {
    return await fetchAPI(`classes/${classIndex}`);
};

export { loadDnDData, loadEquipmentDetails, loadClassDetails };