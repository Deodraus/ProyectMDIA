/**
 * MEDIA TÉCNICA EN DESARROLLO DE SOFTWARE
 * main.js - Lógica interactiva de la interfaz
 * Manejo de navegación, filtros de semilleros de Medellín, interactividad de código y animaciones
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // 1. Header scroll effect
  const siteHeader = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      siteHeader.classList.add('scrolled');
    } else {
      siteHeader.classList.remove('scrolled');
    }
    highlightNavOnScroll();
  });

  // 2. Menú móvil
  const mobileBtn = document.querySelector('.mobile-menu-btn');
  const navMenu = document.querySelector('.nav-menu');
  if (mobileBtn && navMenu) {
    mobileBtn.addEventListener('click', () => {
      navMenu.classList.toggle('active');
      const icon = mobileBtn.querySelector('i');
      if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-xmark');
      }
    });

    // Cerrar al dar click en un enlace
    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('active');
      });
    });
  }

  // 3. Resaltar enlace activo en navbar según el scroll
  const sections = document.querySelectorAll('section[id]');
  function highlightNavOnScroll() {
    const scrollY = window.pageYOffset;
    sections.forEach(current => {
      const sectionHeight = current.offsetHeight;
      const sectionTop = current.offsetTop - 120;
      const sectionId = current.getAttribute('id');
      const navLink = document.querySelector(`.nav-menu a[href*="${sectionId}"]`);

      if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
        if (navLink) navLink.classList.add('active');
      } else {
        if (navLink) navLink.classList.remove('active');
      }
    });
  }

  // 4. Filtrado de Semilleros Gratuitos en Medellín
  const filterBtns = document.querySelectorAll('.filter-btn');
  const semilleroCards = document.querySelectorAll('.semillero-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Activar botón seleccionado
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filterValue = btn.getAttribute('data-filter');

      semilleroCards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filterValue === 'all' || category === filterValue || category.includes(filterValue)) {
          card.style.display = 'flex';
          card.style.animation = 'fadeIn 0.4s ease forwards';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 5. Animación interactiva en el bloque de código de la sección ¿Qué Lograrás?
  const runCodeBtn = document.getElementById('run-demo-btn');
  const terminalOutput = document.getElementById('terminal-live-output');
  if (runCodeBtn && terminalOutput) {
    runCodeBtn.addEventListener('click', () => {
      terminalOutput.innerHTML = '<span style="color: #00d2ff;">Compilando proyecto...</span>';
      runCodeBtn.disabled = true;
      runCodeBtn.innerText = '⚙️ Ejecutando...';

      setTimeout(() => {
        terminalOutput.innerHTML = `
          <div style="color: #10b981; font-weight: bold; margin-bottom: 4px;">✔ ¡Compilación Exitosa (0.18s)!</div>
          <div style="color: #bae6fd;">🚀 Base de Datos MySQL conectada en localhost:3306</div>
          <div style="color: #ffffff;">📱 Servidor web activo en http://localhost:8080/GreenTask</div>
          <div style="color: #38bdf8; margin-top: 6px;">✨ ¡Felicidades! Has publicado tu primera aplicación completa como futuro desarrollador.</div>
        `;
        runCodeBtn.disabled = false;
        runCodeBtn.innerText = '▶ Re-ejecutar Código';
      }, 700);
    });
  }

  // 6. Animación de conteo para estadísticas numéricas
  let countersAnimated = false;
  const statsElements = document.querySelectorAll('.stat-number');
  
  function checkCounters() {
    if (countersAnimated || statsElements.length === 0) return;
    const statsSection = document.querySelector('.hero-stats-bar');
    if (!statsSection) return;

    const rect = statsSection.getBoundingClientRect();
    if (rect.top <= window.innerHeight && rect.bottom >= 0) {
      countersAnimated = true;
      statsElements.forEach(el => {
        const target = parseInt(el.getAttribute('data-target'), 10) || 0;
        const prefix = el.getAttribute('data-prefix') || '';
        const suffix = el.getAttribute('data-suffix') || '';
        let current = 0;
        const increment = Math.max(1, Math.floor(target / 40));
        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          el.innerText = `${prefix}${current}${suffix}`;
        }, 30);
      });
    }
  }

  window.addEventListener('scroll', checkCounters);
  checkCounters(); // Comprobación inicial

});
