const API_KEY = 'YOUR_API_KEY_HERE'; // Replace with your actual API key
const API_URL = 'https://api.globalgiving.org/api/public/projectservice/all/projects/summary';

async function fetchProjects() {
    try {
        const response = await fetch(`${API_URL}?api_key=${API_KEY}`, {
            headers: {
                'Accept': 'application/json'
            }
        });
        const data = await response.json();
        return data.projects.project;
    } catch (error) {
        console.error('Error fetching projects:', error);
        return [];
    }
}

function displayProjects(projects) {
    const projectsContainer = document.getElementById('projects');
    projectsContainer.innerHTML = '';

    projects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.classList.add('project');
        projectElement.innerHTML = `
            <h2>${project.title}</h2>
            <p>${project.summary}</p>
            <p>Goal: $${project.goal}</p>
            <p>Funding: $${project.funding}</p>
            <a href="${project.projectLink}" target="_blank">Learn More</a>
        `;
        projectsContainer.appendChild(projectElement);
    });
}

async function init() {
    const projects = await fetchProjects();
    displayProjects(projects);
}

init();