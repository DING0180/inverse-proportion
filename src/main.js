import 'katex/dist/katex.min.css';
import './styles.css';
import { createClassroomApp } from './core/classroom-app.js';
import { COURSE } from './core/course-data.js';
import { createStepRegistry } from './core/step-registry.js';

const root = document.querySelector('#app');
createClassroomApp({ root, course: COURSE, registry: createStepRegistry({ withDefaults: true }) });
