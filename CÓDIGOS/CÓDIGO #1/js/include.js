async function load(id, file) {
  const el = document.getElementById(id);
  if (!el) return;
  try {
    const response = await fetch(file);
    if (!response.ok) {
      console.error(`Error loading ${file}: ${response.status}`);
      return;
    }
    const html = await response.text();

    if (id === 'head') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Inject links and styles into document.head
      doc.querySelectorAll('link').forEach(l => document.head.appendChild(l.cloneNode(true)));
      doc.querySelectorAll('style').forEach(s => document.head.appendChild(s.cloneNode(true)));

      // Inject scripts in order, waiting for external scripts to load
      const scripts = Array.from(doc.querySelectorAll('script'));
      for (const s of scripts) {
        if (s.src) {
          await new Promise((resolve) => {
            const sc = document.createElement('script');
            sc.src = s.src;
            sc.onload = resolve;
            sc.onerror = () => { console.error('Failed to load', s.src); resolve(); };
            document.head.appendChild(sc);
          });
        } else {
          const sc = document.createElement('script');
          sc.textContent = s.textContent;
          document.head.appendChild(sc);
        }
      }

      // Insert remaining non-executable head content into the #head element
      const headNode = doc.querySelector('head');
      if (headNode) {
        headNode.querySelectorAll('link,script,style').forEach(n => n.remove());
        el.innerHTML = headNode.innerHTML;
      } else {
        el.innerHTML = '';
      }
      console.log(`Loaded head from ${file}`);
    } else {
      el.innerHTML = html;
      console.log(`Loaded ${id} from ${file}`);
    }
  } catch (err) {
    console.error(`Error loading ${file}:`, err);
  }
}

// simple loader; head partials are injected into document.head so links/styles/scripts execute

// Ejecutar cuando el DOM está listo
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    load("head", "partials/head.html");
    load("navbar", "partials/navbar.html");
    load("hero", "partials/hero.html");
    load("main", "partials/main.html");
    load("footer", "partials/footer.html");
  });
} else {
  load("head", "partials/head.html");
  load("navbar", "partials/navbar.html");
  load("hero", "partials/hero.html");
  load("main", "partials/main.html");
  load("footer", "partials/footer.html");
}
