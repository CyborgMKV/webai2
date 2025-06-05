import App from './app.js';

// Start the application
document.addEventListener('DOMContentLoaded', () => {
   console.log('DOM Content Loaded - Starting WebAI 3D Game');
   try {
       window.app = new App();
       console.log('App instance created successfully');
       
       // Add error listener for any unhandled errors
       window.addEventListener('error', (e) => {
           console.error('Unhandled error:', e.error);
           console.error('Error message:', e.message);
           console.error('Error filename:', e.filename);
           console.error('Error line:', e.lineno);
       });
       
       // Monitor physics status after a delay
       setTimeout(() => {
           if (window.app && window.app.game && window.app.game.physicsManager) {
               console.log('Physics Manager Status:', {
                   initialized: window.app.game.physicsManager.initialized,
                   rigidBodies: window.app.game.physicsManager.rigidBodies.size,
                   colliders: window.app.game.physicsManager.colliders.size
               });
           }
       }, 5000);
       
   } catch (error) {
       console.error('Failed to create App instance:', error);
   }
});
