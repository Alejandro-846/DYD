# **Generador de Personajes para GameCampus**  
**✨ Plataforma Avanzada de Creación de Héroes de Fantasía ✨**  

---

## **📌 Descripción del Proyecto**  
**GameCampus** está desarrollando un videojuego de fantasía épica que requiere una herramienta interactiva para crear personajes personalizados basados en el universo de *Dungeons & Dragons*.  

Esta aplicación web permite a los usuarios:  
✅ **Generar personajes** con razas, clases, equipamiento y habilidades únicas.  
✅ **Filtrar y guardar** sus creaciones para uso futuro.  
✅ **Visualizar estadísticas** detalladas con un diseño temático e inmersivo.  

---

## **🚀 Características Principales**  

### **1. Generación Completa de Personajes**  
- **Razas y Clases:** Datos obtenidos de la [D&D 5e API](https://www.dnd5eapi.co/).  
- **Equipamiento Personalizable:** Armas, armaduras y accesorios.  
- **Estadísticas Dinámicas:** Cálculo automático de atributos (Fuerza, Destreza, etc.).  
- **Habilidades Especiales:** Magias y poderes únicos por clase.  

### **2. Sistema de Filtrado Avanzado**  
```javascript
// Ejemplo: Filtrado por raza y clase
const filteredCharacters = characters.filter(
  char => char.race === selectedRace && char.class === selectedClass
);
```

### **3. Guardado y Gestión**  
- **Almacenamiento Local:** Persistencia con `localStorage`.  
- **Exportación a PDF:** Para compartir hojas de personaje.  

### **4. Diseño Responsivo**  
📱 **Mobile-First** | 💻 **Desktop-Optimizado**  

---

## **🛠️ Tecnologías Utilizadas**  

| **Frontend**       | **Backend**      | **APIs**              |  
|--------------------|------------------|-----------------------|  
| HTML5, CSS3, JavaScript | localStorage    | [D&D 5e API](https://www.dnd5eapi.co/) |  
| Particles.js (efectos)  | -               | [MockAPI](https://mockapi.io/) (opcional) |  

---

## **📦 Estructura del Proyecto**  

```
src/
├── api/               # Conexión con APIs
│   ├── dndApi.js      # Cliente de D&D 5e API
│   
├── components/        # Componentes reutilizables
│   ├── character-form.js
│   
├── js/                # Lógica principal
│   ├── main.js        # Punto de entrada
│   └── utils.js       # Funciones auxiliares
├── styles/            # CSS modularizado
│   ├── main.css
│  
└── img/              
```

---

## **🎨 Interfaz de Usuario**  

### **1. Página de Inicio**  
- **Landing Page** con efecto de partículas (`Particles.js`).  
- **Texto rotativo** con clases disponibles.  

### **2. Formulario de Creación**  
```javascript
// Ejemplo: Selector dinámico de razas
async function loadRaces() {
  const races = await DndApi.getRaces();
  races.forEach(race => {
    const option = document.createElement('option');
    option.value = race.index;
    option.textContent = race.name;
    raceSelect.appendChild(option);
  });
}
```

### **3. Vista de Personajes Guardados**  
- **Cards interactivas** con filtros por nombre, raza o clase.  
- **Modal de detalles** al hacer clic en un personaje.  

---

## **⚙️ Requisitos Funcionales**  

| **Funcionalidad**          | **Estado** |  
|----------------------------|------------|  
| Generación de personajes   | ✅ Implementado |  
| Filtrado por atributos     | ✅ Implementado |  
| Guardado en localStorage  | ✅ Implementado |  
| Exportación a PDF         | 🚧 En progreso |  

---

## **📱 Compatibilidad**  
- **Navegadores:** Chrome, Firefox, Edge (versiones recientes).  
- **Dispositivos:** Mobile (≥320px), Tablet (≥768px), Desktop (≥1024px).  

---

## **🔮 Roadmap Futuro**  

1. **Sistema de Niveles:** Progresión hasta nivel 20.  
2. **Inteligencia Artificial:** Generación de trasfondos con OpenAI.  
3. **Modo DM:** Herramientas para Dungeon Masters.  

---

## **📥 Instalación y Uso**  

1. **Clonar el repositorio:**  
```bash
git clone https://github.com/Alejandro-846/DYD
```

```

---

## **🤝 Contribuciones**  
¡Se aceptan *issues* y *pull requests*!  
📌 **Repositorio:** [https://github.com/Alejandro-846/DYD](https://github.com/Alejandro-846/DYD)  

---

**✨ ¡Forja tu héroe y prepárate para la aventura! ✨**  

> *"No es el tamaño del personaje lo que importa, sino el tamaño de su corazón de héroe."* — *Anónimo*