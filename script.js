(function () {
  var NUM = window.WA_NUMBER;

  function waUrl(text) {
    return "https://wa.me/" + NUM + "?text=" + encodeURIComponent(text);
  }

  // Todos los botones con data-wa abren WhatsApp con su mensaje.
  document.querySelectorAll("[data-wa]").forEach(function (a) {
    a.href = waUrl(a.dataset.wa);
    a.target = "_blank";
    a.rel = "noopener";
  });

  // Testimonios
  var box = document.getElementById("reviews");
  var items = window.TESTIMONIOS || [];
  if (!items.length) {
    box.innerHTML = '<p class="reviews__empty">Pronto vas a ver acá las opiniones de nuestros clientes. ¡Sé el primero en dejar la tuya!</p>';
  } else {
    items.forEach(function (t) {
      var d = document.createElement("blockquote");
      d.className = "review";
      d.style.margin = "0";
      var p = document.createElement("p");
      p.textContent = "“" + t.texto + "”";
      var f = document.createElement("footer");
      var b = document.createElement("b");
      b.textContent = t.nombre;
      f.appendChild(b);
      f.appendChild(document.createTextNode([t.rubro, t.localidad].filter(Boolean).join(" · ")));
      d.appendChild(p);
      d.appendChild(f);
      box.appendChild(d);
    });
  }

  // Botón de Google
  var g = document.getElementById("googleBtn");
  if (window.GOOGLE_REVIEW_URL) {
    g.href = window.GOOGLE_REVIEW_URL;
  } else {
    g.hidden = true;
  }

  // Formulario de contacto -> WhatsApp, con mensaje armado según el rubro
  var PLANTILLAS = {
    "Avícola": "Hola, tengo una avícola y quiero consultar por pan rallado y rebozadores FREC para pollo (milanesas, nuggets, patitas). ¿Me pasan la lista de precios y las condiciones de entrega?",
    "Panadería": "Hola, tengo una panadería y quiero consultar por harinas y pan rallado FREC. ¿Me pasan precios por bolsa de 25 kg y por pallet?",
    "Rotisería": "Hola, tengo una rotisería y quiero consultar por pan rallado y rebozadores FREC para milanesas, y también por aceites y condimentos. ¿Me pasan la lista de precios?",
    "Restaurante": "Hola, tengo un restaurante y quiero consultar por pan rallado, rebozadores, aceites y condimentos. ¿Me pasan la lista de precios y las condiciones de entrega?",
    "Carnicería": "Hola, tengo una carnicería y quiero consultar por pan rallado, rebozadores y condimentos para milanesas y hamburguesas. ¿Me pasan la lista de precios?",
    "Granja": "Hola, tengo una granja y quiero consultar por pan rallado y rebozadores para elaborar mis productos. ¿Me pasan la lista de precios y las condiciones de entrega?",
    "Distribuidor / revendedor": "Hola, soy distribuidor / revendedor y quiero consultar por la compra por pallet (1.000 kg) de pan rallado, rebozadores y harinas. ¿Me pasan la lista de precios mayorista?",
    "Otro": "Hola, quiero hacer una consulta sobre sus productos. ¿Me pasan la lista de precios?"
  };

  var form = document.getElementById("contactForm");
  var err = document.getElementById("formErr");
  var selRubro = document.getElementById("cfRubro");
  var txtMsg = document.getElementById("cfMensaje");
  var autoText = "";

  // Al elegir el rubro se completa el mensaje, salvo que la persona ya lo haya modificado.
  selRubro.addEventListener("change", function () {
    var plantilla = PLANTILLAS[selRubro.value] || "";
    if (!txtMsg.value.trim() || txtMsg.value === autoText) {
      txtMsg.value = plantilla;
      autoText = plantilla;
    }
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var d = new FormData(form);
    var v = function (k) { return (d.get(k) || "").toString().trim(); };
    if (!v("rubro") || !v("nombre") || !v("localidad") || !v("mensaje")) {
      err.hidden = false;
      return;
    }
    err.hidden = true;
    var msg = v("mensaje") + "\n\n" +
      "Nombre: " + v("nombre") + "\n" +
      "Rubro: " + v("rubro") + "\n" +
      "Localidad: " + v("localidad");
    window.open(waUrl(msg), "_blank", "noopener");
    form.reset();
    autoText = "";
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  // ---- Efectos de difuminado ----
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // La foto de portada entra desenfocada y se aclara al cargar.
  var heroImg = document.querySelector(".hero__img");
  if (heroImg) {
    var sharpen = function () { heroImg.classList.add("is-loaded"); };
    if (heroImg.complete) { setTimeout(sharpen, 60); }
    else { heroImg.addEventListener("load", sharpen); heroImg.addEventListener("error", sharpen); }
  }

  if (reduce || !("IntersectionObserver" in window)) {
    document.documentElement.classList.remove("js");
    return;
  }

  // Los elementos aparecen desde el desenfoque al entrar en pantalla, escalonados.
  var groups = [
    ".section .tag", ".section h2", ".section > .inner > .muted", ".rules li", ".hero__txt > *",
    ".nos > div", ".prod__media .pcard__frame", ".prod__txt > *", ".more > *", ".ocard",
    ".band__txt > *", ".opts > div", ".band__img",
    ".review", ".reviews__empty", ".rate__box", ".contact > *", ".footer__in > div"
  ];
  var seen = new Set();
  groups.forEach(function (sel) {
    document.querySelectorAll(sel).forEach(function (el) {
      if (seen.has(el)) return;
      seen.add(el);
      el.setAttribute("data-reveal", "");
      var sibs = el.parentElement ? Array.prototype.filter.call(el.parentElement.children, function (c) { return c.matches(sel); }) : [];
      el.style.setProperty("--d", Math.min(sibs.indexOf(el), 5) * 90 + "ms");
    });
  });

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      // Se repite: aparece al entrar en pantalla y se reinicia al salir.
      if (e.isIntersecting) { e.target.classList.add("is-in"); }
      else { e.target.classList.remove("is-in"); }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
  seen.forEach(function (el) { io.observe(el); });

  // La portada se desenfoca y se acerca un poco al bajar.
  var media = document.querySelector(".hero__media");
  if (heroImg && media) {
    var ticking = false;
    var update = function () {
      var h = media.offsetHeight;
      var p = Math.min(Math.max(window.scrollY / h, 0), 1);
      if (heroImg.classList.contains("is-loaded")) {
        heroImg.style.transition = "none";
        heroImg.style.filter = "blur(" + (p * 8).toFixed(2) + "px)";
        heroImg.style.transform = "scale(" + (1 + p * 0.08).toFixed(3) + ") translateY(" + (p * 40).toFixed(1) + "px)";
      }
      ticking = false;
    };
    window.addEventListener("scroll", function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
  }
})();
