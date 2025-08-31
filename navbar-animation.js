// Navigation rocket animation handlers
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        // Click effect
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links
            navLinks.forEach(l => l.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Add launching effect
            this.classList.add('launching');
            
            // Remove launching effect after animation
            setTimeout(() => {
                this.classList.remove('launching');
            }, 800);
            
            // Simulate page change (you can replace this with actual navigation)
            const section = this.getAttribute('data-section');
            console.log(`Navigating to: ${section}`);
            
            // You can add actual navigation logic here
            // window.location.href = `#${section}`;
        });
        
        // Touch support for mobile
        link.addEventListener('touchstart', function() {
            this.style.background = 'rgba(43, 214, 178, 0.1)';
        });
        
        link.addEventListener('touchend', function() {
            setTimeout(() => {
                if (!this.matches(':hover')) {
                    this.style.background = '';
                }
            }, 150);
        });
    });
});

// Responsive behavior
function handleResize() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (window.innerWidth <= 576) {
        // Simplify animations on very small screens
        navLinks.forEach(link => {
            link.style.setProperty('--animation-complexity', 'simple');
        });
    } else {
        navLinks.forEach(link => {
            link.style.removeProperty('--animation-complexity');
        });
    }
}

window.addEventListener('resize', handleResize);
window.addEventListener('load', handleResize);